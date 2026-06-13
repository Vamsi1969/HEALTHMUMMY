"""Application configuration loaded from environment variables."""

from typing import Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable overrides."""

    # API Security
    api_key: str = "dev-key-change-in-production"

    # JWT Auth
    jwt_secret: str = "change-this-to-a-random-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # LLM Provider - OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"

    # LLM Provider - Google Gemini
    google_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.0-flash"

    # LLM Provider - OpenRouter (free tier fallback)
    openrouter_api_key: Optional[str] = None
    openrouter_model: str = "nvidia/llama-nemotron-rerank-vl-1b-v2:free"

    # LLM Provider preference
    llm_provider: str = "openai"

    # Database
    database_url: str = "sqlite:///./health_assistant.db"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse comma-separated CORS origins string into a list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Rate Limiting
    rate_limit_requests: int = 20
    rate_limit_window_seconds: int = 60

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "case_sensitive": False}


settings = Settings()

# Warn if no LLM API key is configured
if settings.openai_api_key is None and settings.google_api_key is None:
    print("NOTE: No paid LLM API key configured. Will use OpenRouter free tier (if OPENROUTER_API_KEY is set) or rule-based fallback.")
