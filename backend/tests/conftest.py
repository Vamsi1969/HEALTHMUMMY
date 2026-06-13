"""Pytest fixtures for Health Assistant auth tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Override DATABASE_URL BEFORE importing app modules
# Use in-memory SQLite for test isolation
import os
os.environ["DATABASE_URL"] = "sqlite:///./test_health_assistant.db"
os.environ["JWT_SECRET"] = "test-secret-key-not-for-production"
os.environ["API_KEY"] = "dev-key-change-in-production"

from app.database.db import Base, get_db, User
from app.main import app
from app.services.auth_service import hash_password, create_access_token


# ── Test Database ────────────────────────────────────────────────

TEST_DB_URL = "sqlite:///./test_health_assistant.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Override the get_db dependency to use the test database."""
    db = TestSessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def override_security_middleware(request):
    """Bypass security middleware for tests."""
    return True


# Override dependencies
app.dependency_overrides[get_db] = override_get_db


# ── Fixtures ─────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop all data after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    with test_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture()
def client():
    """FastAPI test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def sample_user_data():
    """Default user data for registration tests."""
    return {
        "email": "alice@example.com",
        "name": "Alice Johnson",
        "password": "securePass123",
    }


@pytest.fixture()
def sample_user_db():
    """Create and return a pre-existing user in the database."""
    db = TestSessionLocal()
    try:
        user = User(
            email="existing@example.com",
            name="Existing User",
            hashed_password=hash_password("password123"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


@pytest.fixture()
def sample_user_token(sample_user_db):
    """Generate a valid JWT token for the sample user."""
    return create_access_token(sample_user_db.id, sample_user_db.email)


@pytest.fixture()
def expired_token():
    """Generate a token that looks valid but has an invalid signature."""
    return (
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        ".eyJzdWIiOiJmYWtlLXVzZXItaWQiLCJleHAiOjk5OTk5OTk5OTl9"
        ".fake-signature-that-wont-verify"
    )
