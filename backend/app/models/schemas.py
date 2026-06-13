"""Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional, Literal
from datetime import datetime


# ── Auth Schemas ─────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """User registration payload."""
    email: str = Field(..., min_length=5, max_length=255)
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.strip().lower()


class LoginRequest(BaseModel):
    """User login payload."""
    email: str = Field(...)
    password: str = Field(...)

    @field_validator("email")
    @classmethod
    def email_lower(cls, v: str) -> str:
        return v.strip().lower()


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Public user info returned to the client."""
    id: str
    email: str
    name: str
    created_at: str


class ChangePasswordRequest(BaseModel):
    """Change password payload."""
    current_password: str = Field(...)
    new_password: str = Field(..., min_length=6, max_length=128)


# ── Health Assistant Schemas ─────────────────────────────────────

class SymptomInput(BaseModel):
    """User describes their health issue/symptoms."""
    description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Description of symptoms or health concern",
    )

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Description cannot be empty")
        return stripped


class HealthAnalysisRequest(BaseModel):
    """Full request for health analysis."""
    description: str = Field(..., min_length=10, max_length=2000)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[Literal["male", "female", "other"]] = None
    duration: Optional[str] = Field(None, max_length=100)
    severity: Optional[Literal["mild", "moderate", "severe"]] = None


class PossibleCondition(BaseModel):
    """A possible medical condition returned by AI."""
    name: str
    probability: Literal["high", "medium", "low"]
    description: str
    urgency: Literal["emergency", "see_doctor_soon", "monitor", "self_care"]
    common_symptoms: list[str] = []


class MedicationSuggestion(BaseModel):
    """Medication suggestion with precautions."""
    name: str
    category: str
    dosage_notes: str
    is_prescription_required: bool = True
    warnings: list[str] = []
    common_side_effects: list[str] = []


class HealthAnalysisResponse(BaseModel):
    """Full AI analysis response."""
    id: str
    analysis: str
    possible_conditions: list[PossibleCondition] = []
    medication_suggestions: list[MedicationSuggestion] = []
    lifestyle_recommendations: list[str] = []
    when_to_see_doctor: str
    disclaimer: str = (
        "This is an AI-generated suggestion for informational purposes only. "
        "It is NOT a substitute for professional medical advice, diagnosis, or treatment. "
        "Always consult a qualified healthcare provider with any medical concerns."
    )
    created_at: str


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    code: str = "error"


class HealthCheckResponse(BaseModel):
    """Health check endpoint response."""
    status: str
    version: str = "1.0.0"
    timestamp: str


class ChatMessage(BaseModel):
    """A single chat message."""
    role: Literal["user", "assistant"]
    content: str
    timestamp: Optional[str] = None


class ChatHistory(BaseModel):
    """Chat history for context."""
    messages: list[ChatMessage] = []
