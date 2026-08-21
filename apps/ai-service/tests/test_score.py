import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_calculate_health_score_excellent():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/score/calculate",
            json={
                "total_instances": 12,
                "on_time_instances": 12,
                "overdue_instances": 0,
                "active_notices": 0,
                "unresolved_notices": 0,
                "is_verified": True,
                "gstin_verified": True,
                "udyam_verified": True,
                "pan_verified": True,
                "tax_demands_pending": 0.0,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["score"] >= 800
        assert data["grade"] == "AAA_EXCELLENT"
        assert data["pillar_scores"]["filing_timeliness"] == 210
        assert data["pillar_scores"]["identity_authenticity"] == 120


@pytest.mark.asyncio
async def test_calculate_health_score_with_penalties():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/score/calculate",
            json={
                "total_instances": 12,
                "on_time_instances": 6,
                "overdue_instances": 3,
                "active_notices": 2,
                "unresolved_notices": 2,
                "is_verified": False,
                "tax_demands_pending": 450000.0,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["score"] < 700
        assert data["grade"] in ["A_MODERATE", "NEEDS_IMPROVEMENT"]
