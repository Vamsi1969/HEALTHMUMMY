"""Observability middleware for logging, request tracking, and monitoring."""

import time
import logging
import uuid
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("health-assistant")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs all requests and responses."""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # Log request
        logger.info(
            "➡️  %s %s [%s]",
            request.method,
            request.url.path,
            request_id,
        )

        try:
            response = await call_next(request)
            elapsed = time.time() - start_time

            # Log response
            logger.info(
                "⬅️  %s %s [%s] — %s (%.2fs)",
                request.method,
                request.url.path,
                request_id,
                response.status_code,
                elapsed,
            )

            # Add request ID header
            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as e:
            elapsed = time.time() - start_time
            logger.error(
                "❌ %s %s [%s] — error: %s (%.2fs)",
                request.method,
                request.url.path,
                request_id,
                str(e),
                elapsed,
            )
            raise


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(name)
