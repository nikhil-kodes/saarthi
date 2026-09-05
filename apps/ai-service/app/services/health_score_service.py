from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

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
    model_version: str = "rich_rule_based_v2"
    confidence: float = 1.0


class HealthScoreCalculator:
    """Calculates MSME Compliance Health Score (300 - 900) using a rich rule-based engine."""

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
        
        # Pillar 1: Filing Timeliness (Max 210)
        # Evaluates the promptness of statutory filings (GST, TDS, PF, etc.)
        p1_score = 0
        if total_instances > 0:
            on_time_rate = on_time_instances / total_instances
            overdue_rate = overdue_instances / total_instances
            
            # Base timeliness score
            base_p1 = on_time_rate * 210
            
            # Heavy penalty for overdue instances
            penalty_p1 = overdue_rate * 300 
            
            p1_score = max(0, min(210, int(base_p1 - penalty_p1)))
        else:
            # If no history, assign a neutral default
            p1_score = 150
            
        # Pillar 2: Notice Resolution (Max 120)
        # Evaluates how quickly and effectively the MSME resolves regulatory notices
        p2_score = 120
        if unresolved_notices > 0:
            # Unresolved notices are a massive red flag
            if unresolved_notices == 1:
                p2_score -= 50
            elif unresolved_notices == 2:
                p2_score -= 90
            else:
                p2_score = 0
        
        if active_notices > 0:
            # Active but resolved is better, but still indicates scrutiny
            p2_score -= (active_notices * 15)
            
        p2_score = max(0, min(120, p2_score))
        
        # Pillar 3: Identity Authenticity (Max 120)
        # Evaluates KYC completeness and verifiable credentials
        p3_score = 0
        if is_verified:
            p3_score += 30
        if gstin_verified:
            p3_score += 40
        if udyam_verified:
            p3_score += 25
        if pan_verified:
            p3_score += 25
            
        p3_score = max(0, min(120, p3_score))
        
        # Pillar 4: Financial Discipline (Max 90)
        # Evaluates tax demands and financial compliance
        p4_score = 90
        if tax_demands_pending > 1000000:
            p4_score = 0
        elif tax_demands_pending > 500000:
            p4_score = 20
        elif tax_demands_pending > 100000:
            p4_score = 45
        elif tax_demands_pending > 0:
            p4_score = 70
            
        # Pillar 5: Regulatory Adherence (Max 60)
        # Evaluates overall adherence to labor, safety, and operational regulations
        p5_score = 60
        if overdue_instances > 2:
            p5_score -= 40
        elif overdue_instances > 0:
            p5_score -= 20
            
        if active_notices > 2:
            p5_score -= 20
            
        p5_score = max(0, min(60, p5_score))
        
        # Total Score
        final_score = 300 + p1_score + p2_score + p3_score + p4_score + p5_score
        final_score = min(900, max(300, final_score))
        
        if final_score >= 800:
            grade = "AAA_EXCELLENT"
        elif final_score >= 700:
            grade = "AA_GOOD"
        elif final_score >= 600:
            grade = "A_MODERATE"
        else:
            grade = "NEEDS_IMPROVEMENT"
            
        factors = {
            "insights": [
                "Perfect filing record." if p1_score == 210 else "Room for improvement in filing timelines.",
                "Zero unresolved notices." if unresolved_notices == 0 else f"{unresolved_notices} notices require immediate attention.",
                "Complete KYC verified." if p3_score == 120 else "Pending KYC verification steps.",
                "Clean financial slate." if tax_demands_pending == 0 else f"Outstanding tax demand of ₹{tax_demands_pending:,.2f}.",
            ],
            "recommendations": []
        }
        
        if overdue_instances > 0:
            factors["recommendations"].append(f"File the {overdue_instances} overdue returns immediately to stop accumulating late fees.")
        if unresolved_notices > 0:
            factors["recommendations"].append("Respond to pending show cause notices within the deadline.")
        if not (gstin_verified and udyam_verified and pan_verified):
            factors["recommendations"].append("Complete missing KYC verifications to boost identity score.")
            
        return HealthScoreResult(
            score=final_score,
            grade=grade,
            pillar_scores=PillarBreakdown(
                filing_timeliness=p1_score,
                notice_resolution=p2_score,
                identity_authenticity=p3_score,
                financial_discipline=p4_score,
                regulatory_adherence=p5_score,
            ),
            factors=factors,
            model_version="rich_rule_based_v2",
            confidence=1.0,
        )
