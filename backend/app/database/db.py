"""Database setup using SQLAlchemy with SQLite."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, Text, DateTime, JSON, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    """Registered user accounts."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class HealthAnalysisLog(Base):
    """Logs of health analysis requests and responses."""
    __tablename__ = "health_analysis_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_description = Column(Text, nullable=False)
    analysis_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(45), nullable=True)
    user_id = Column(String(36), nullable=True)


class ChatHistoryLog(Base):
    """Persistent chat history."""
    __tablename__ = "chat_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), nullable=False, index=True)
    role = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = Column(String(36), nullable=True)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for database sessions. Ensures cleanup on exception."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def save_analysis_log(db, description: str, response: dict) -> str:
    """Save an analysis request/response to the database."""
    log = HealthAnalysisLog(user_description=description, analysis_response=response)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log.id
