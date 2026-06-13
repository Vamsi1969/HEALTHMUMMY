"""Main Health Assistant API router with chat, analysis, and suggestions."""

import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.schemas import (
    SymptomInput,
    HealthAnalysisRequest,
    HealthAnalysisResponse,
    HealthCheckResponse,
    ChatMessage,
    ChatHistory,
)
from app.services.ai_service import analyze_symptoms, format_analysis_response
from app.database.db import get_db, save_analysis_log, ChatHistoryLog
from app.middleware.security import verify_api_key

router = APIRouter(prefix="/api", tags=["Health Assistant"])


@router.post("/analyze", response_model=HealthAnalysisResponse)
async def analyze_health(
    request: HealthAnalysisRequest,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_api_key),
):
    """Analyze symptoms and get possible conditions, medications, and recommendations."""
    # Run AI analysis
    raw_result = await analyze_symptoms(
        description=request.description,
        age=request.age,
        gender=request.gender,
        duration=request.duration,
        severity=request.severity,
    )

    # Save to database
    analysis_id = save_analysis_log(db, request.description, raw_result)

    # Format and return response
    return format_analysis_response(raw_result, analysis_id)


@router.post("/chat")
async def chat(
    symptom_input: SymptomInput,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_api_key),
):
    """Chat-style endpoint: send symptoms, get AI response with conversation history."""
    if not session_id:
        session_id = str(uuid.uuid4())

    # Run AI analysis (reuse the analyze function)
    raw_result = await analyze_symptoms(description=symptom_input.description)
    analysis_id = save_analysis_log(db, symptom_input.description, raw_result)
    formatted = format_analysis_response(raw_result, analysis_id)

    # Save messages to chat history
    user_msg = ChatHistoryLog(session_id=session_id, role="user", content=symptom_input.description)
    assistant_msg = ChatHistoryLog(
        session_id=session_id,
        role="assistant",
        content=formatted["analysis"],
    )
    db.add_all([user_msg, assistant_msg])
    db.commit()

    return {
        "session_id": session_id,
        "message": {
            "role": "assistant",
            "content": formatted["analysis"],
            "conditions": formatted["possible_conditions"],
            "medications": formatted["medication_suggestions"],
            "recommendations": formatted["lifestyle_recommendations"],
            "when_to_see_doctor": formatted["when_to_see_doctor"],
        },
        "disclaimer": formatted["disclaimer"],
        "created_at": formatted["created_at"],
    }


@router.get("/history/{session_id}")
async def get_history(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Get chat history for a session."""
    messages = (
        db.query(ChatHistoryLog)
        .filter(ChatHistoryLog.session_id == session_id)
        .order_by(ChatHistoryLog.created_at.asc())
        .all()
    )
    return {
        "session_id": session_id,
        "messages": [
            ChatMessage(
                role=msg.role,
                content=msg.content,
                timestamp=msg.created_at.isoformat(),
            )
            for msg in messages
        ],
    }
