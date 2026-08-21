from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.health_score_service import (
    HealthScoreCalculator,
    HealthScoreResult,
)

router = APIRouter(prefix="/api/v1/score", tags=["Compliance Health Score"])


class ScoreCalculationRequest(BaseModel):
    total_instances: int = 12
    on_time_instances: int = 11
    overdue_instances: int = 0
    active_notices: int = 0
    unresolved_notices: int = 0
    is_verified: bool = True
    gstin_verified: bool = True
    udyam_verified: bool = True
    pan_verified: bool = True
    tax_demands_pending: float = 0.0


@router.post("/calculate", response_model=HealthScoreResult)
async def calculate_score(request: ScoreCalculationRequest) -> HealthScoreResult:
    """Computes dynamic 5-pillar Compliance Health Score."""
    try:
        return HealthScoreCalculator.calculate(
            total_instances=request.total_instances,
            on_time_instances=request.on_time_instances,
            overdue_instances=request.overdue_instances,
            active_notices=request.active_notices,
            unresolved_notices=request.unresolved_notices,
            is_verified=request.is_verified,
            gstin_verified=request.gstin_verified,
            udyam_verified=request.udyam_verified,
            pan_verified=request.pan_verified,
            tax_demands_pending=request.tax_demands_pending,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Score calculation failed: {str(e)}")
