"""Security middleware for API key authentication, JWT auth, and rate limiting."""

import time
from typing import Optional
from fastapi import Request, HTTPException, Depends
from fastapi.security import APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Paths that don't require auth
PUBLIC_PATHS = {
    "/docs", "/openapi.json", "/redoc", "/health",
    "/api/auth/register", "/api/auth/login",
}


class RateLimiter:
    """Simple in-memory rate limiter."""

    def __init__(self):
        self._requests: dict[str, list[float]] = {}

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        if key not in self._requests:
            self._requests[key] = []

        # Clean old entries
        self._requests[key] = [t for t in self._requests[key] if now - t < window_seconds]

        if len(self._requests[key]) >= max_requests:
            return True

        self._requests[key].append(now)
        return False


rate_limiter = RateLimiter()


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for request validation, CORS headers, and rate limiting."""

    async def dispatch(self, request: Request, call_next):
        # Skip security for public paths
        path = request.url.path
        if path in PUBLIC_PATHS:
            return await call_next(request)

        # Rate limiting by IP
        client_ip = request.client.host if request.client else "unknown"
        if rate_limiter.is_rate_limited(
            client_ip,
            settings.rate_limit_requests,
            settings.rate_limit_window_seconds,
        ):
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {settings.rate_limit_requests} requests per {settings.rate_limit_window_seconds} seconds.",
            )

        return await call_next(request)


def verify_api_key(api_key: Optional[str] = Depends(api_key_header)):
    """Dependency to verify API key for protected endpoints."""
    # Skip if the API key is the default dev key (allows easy dev setup)
    if settings.api_key == "dev-key-change-in-production" and not api_key:
        return True
    if not api_key or api_key != settings.api_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key. Provide via X-API-Key header.",
        )
    return True
