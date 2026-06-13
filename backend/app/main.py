"""Health Assistant — FastAPI Application.

AI-powered health symptom analysis and medication suggestion service.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.db import init_db
from app.routers import health, assistant, auth
from app.middleware.logging import LoggingMiddleware, logger
from app.middleware.security import SecurityMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and check config on startup, cleanup on shutdown."""
    logger.info("Health Assistant starting up...")
    init_db()
    logger.info("Database initialized")
    if settings.openai_api_key:
        logger.info("OpenAI provider configured")
    elif settings.google_api_key:
        logger.info("Gemini provider configured")
    elif settings.openrouter_api_key:
        logger.info("OpenRouter provider configured (%s)", settings.openrouter_model)
    else:
        logger.warning("No LLM API key set - using fallback rule-based analysis")
    yield
    logger.info("Health Assistant shutting down...")


app = FastAPI(
    title="Health Assistant API",
    description="AI-powered health symptom analysis and medication suggestion service. "
    "NOT a substitute for professional medical advice.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Security & CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityMiddleware)
app.add_middleware(LoggingMiddleware)

# Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(assistant.router)


@app.get("/")
async def root():
    """Root endpoint with API overview."""
    return {
        "name": "Health Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "GET /health",
            "auth": {
                "register": "POST /api/auth/register",
                "login": "POST /api/auth/login",
                "profile": "GET /api/auth/me",
                "change_password": "POST /api/auth/change-password",
            },
            "assistant": {
                "analyze": "POST /api/analyze",
                "chat": "POST /api/chat",
                "history": "GET /api/history/{session_id}",
            },
        },
        "disclaimer": "This is NOT a substitute for professional medical advice.",
    }
