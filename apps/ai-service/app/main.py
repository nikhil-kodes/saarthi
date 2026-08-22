from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.config import settings
from app.routers.rag import router as rag_router
from app.routers.ocr import router as ocr_router
from app.routers.score import router as score_router
from app.routers.chat import router as chat_router


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}...")
    yield
    # Shutdown
    print(f"Shutting down {settings.app_name}...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Saarthi AI / Processing Service for OCR, RAG, and Compliance Health Scoring",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(rag_router)
app.include_router(ocr_router)
app.include_router(score_router)
app.include_router(chat_router)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Root health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="ai-service",
        version=settings.app_version,
    )


@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def api_v1_health_check() -> HealthResponse:
    """Versioned health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="ai-service",
        version=settings.app_version,
    )
