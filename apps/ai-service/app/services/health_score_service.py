from typing import Any, Dict
from pydantic import BaseModel


class PillarBreakdown(BaseModel):
    filing_timeliness: int  # Max 210
    notice_resolution: int  # Max 120
    identity_authenticity: int  # Max 120
    financial_discipline: int  # Max 90
    regulatory_adherence: int  # Max 60


class HealthScoreResult(BaseModel):
    score: int  # 300 - 900
    grade: str  # 'AAA_EXCELLENT', 'AA_GOOD', 'A_MODERATE', 'NEEDS_IMPROVEMENT'
    pillar_scores: PillarBreakdown
    factors: Dict[str, Any]


class HealthScoreCalculator:
    """Calculates the 5-pillar MSME Compliance Health Score (300 - 900)

    per PRD.md §11 & WORKFLOW.md Flow 11.
    """

    @classmethod
    def calculate(
        cls,
        total_instances: int = 12,
        on_time_instances: int = 11,
        overdue_instances: int = 0,
        active_notices: int = 0,
        unresolved_notices: int = 0,
        is_verified: bool = True,
        gstin_verified: bool = True,
        udyam_verified: bool = True,
        pan_verified: bool = True,
        tax_demands_pending: float = 0.0,
    ) -> HealthScoreResult:
        # Base credit score points
        BASE_SCORE = 300

        # Pillar 1: Filing Timeliness (Max 210 pts)
        if total_instances > 0:
            timeliness_ratio = max(0.0, (on_time_instances - overdue_instances * 2) / total_instances)
            p1_score = int(min(210, max(0, timeliness_ratio * 210)))
        else:
            p1_score = 180

        # Pillar 2: Notice Resolution Velocity (Max 120 pts)
        if unresolved_notices == 0 and active_notices == 0:
            p2_score = 120
        elif unresolved_notices == 0 and active_notices > 0:
            p2_score = 90
        else:
            p2_score = max(20, 120 - unresolved_notices * 40)

        # Pillar 3: Verification & Identity Authenticity (Max 120 pts)
        p3_score = 0
        if pan_verified:
            p3_score += 40
        if gstin_verified:
            p3_score += 40
        if udyam_verified:
            p3_score += 40
        if not is_verified:
            p3_score = min(p3_score, 40)

        # Pillar 4: Financial & Tax Discipline (Max 90 pts)
        if tax_demands_pending <= 0:
            p4_score = 90
        elif tax_demands_pending < 50000:
            p4_score = 65
        else:
            p4_score = 40

        # Pillar 5: Regulatory Adherence (Max 60 pts)
        p5_score = 60 if overdue_instances == 0 else 35

        total_score = BASE_SCORE + p1_score + p2_score + p3_score + p4_score + p5_score
        total_score = min(900, max(300, total_score))

        if total_score >= 800:
            grade = "AAA_EXCELLENT"
        elif total_score >= 700:
            grade = "AA_GOOD"
        elif total_score >= 600:
            grade = "A_MODERATE"
        else:
            grade = "NEEDS_IMPROVEMENT"

        return HealthScoreResult(
            score=total_score,
            grade=grade,
            pillar_scores=PillarBreakdown(
                filing_timeliness=p1_score,
                notice_resolution=p2_score,
                identity_authenticity=p3_score,
                financial_discipline=p4_score,
                regulatory_adherence=p5_score,
            ),
            factors={
                "total_instances": total_instances,
                "on_time_instances": on_time_instances,
                "overdue_instances": overdue_instances,
                "unresolved_notices": unresolved_notices,
                "is_verified": is_verified,
            },
        )
