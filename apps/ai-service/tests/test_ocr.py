import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_parse_gst_drc01a_notice():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ocr/parse",
            json={
                "file_name": "GST_DRC01A_Notice.pdf",
                "legal_name": "Sharma Foods Pvt Ltd",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "GST" in data["authority"] or "State Tax" in data["authority"]
        assert data["demand_amount"] > 0
        assert data["severity"] == "critical"
        assert len(data["plain_summary_en"]) > 20
        assert len(data["plain_summary_hi"]) > 20
        assert "Sharma Foods" in data["reply_draft_en"] or "Proper Officer" in data["reply_draft_en"] or "Authorized" in data["reply_draft_en"]


@pytest.mark.asyncio
async def test_parse_incometax_notice():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ocr/parse",
            json={
                "file_name": "IncomeTax_148A_Notice.pdf",
                "legal_name": "Rajesh Kumar Enterprises",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "Income" in data["authority"] or "Tax" in data["authority"]
        assert data["severity"] in ["urgent", "critical"]
        assert len(data["plain_summary_en"]) > 20



@pytest.mark.asyncio
async def test_generate_reply_letter():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ocr/reply-letter",
            json={
                "authority": "State Tax Officer, UP GST",
                "notice_number": "DRC-9912",
                "legal_name": "Sharma Foods Pvt Ltd",
                "grounds": "1. All tax invoices were duly reported in GSTR-1 by registered suppliers.",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Sharma Foods Pvt Ltd" in data["letter"]
        assert "DRC-9912" in data["letter"]
