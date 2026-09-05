from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import (
    RAGService,
    RAGQueryRequest,
    RAGQueryResponse,
)
from app.services.summarizer import (
    CircularSummarizer,
    CircularSummary,
)

router = APIRouter(prefix="/api/v1/rag", tags=["Regulatory Intelligence & RAG"])


class SummarizeRequest(BaseModel):
    title: str
    content: str
    source: str = "Government of India"


@router.post("/query", response_model=RAGQueryResponse)
async def query_regulatory_rag(request: RAGQueryRequest) -> RAGQueryResponse:
    """Answers compliance queries with grounded citations from statutory circulars."""
    try:
        return RAGService.query(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")


@router.post("/summarize", response_model=CircularSummary)
async def summarize_regulatory_circular(request: SummarizeRequest) -> CircularSummary:
    """Summarizes a regulatory circular into plain English and Hindi with an impact matrix."""
    try:
        return await CircularSummarizer.summarize_circular_ai(
            title=request.title,
            content=request.content,
            source=request.source,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.get("/updates")
async def get_recent_updates() -> Dict[str, Any]:
    """Returns static / cached regulatory updates feed."""
    return {
        "success": True,
        "count": len(RAGService._CORPUS),
        "updates": RAGService._CORPUS,
    }
