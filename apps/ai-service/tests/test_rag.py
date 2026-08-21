import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_rag_query_gst():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/rag/query",
            json={"query": "What are the rules for GST input tax credit and e-invoicing?", "locale": "en"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "GSTR-2B" in data["answer"] or "e-invoicing" in data["answer"]
        assert len(data["sources"]) > 0
        assert data["confidence_score"] > 0.5
        assert data["sources"][0]["relevance_score"] > 0


@pytest.mark.asyncio
async def test_rag_query_hindi():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/rag/query",
            json={"query": "जीएसटी इनपुट टैक्स क्रेडिट के नियम क्या हैं?", "locale": "hi"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["locale"] == "hi"
        assert len(data["sources"]) > 0


@pytest.mark.asyncio
async def test_circular_summarizer():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/rag/summarize",
            json={
                "title": "FSSAI Mandatory Display of Front of Pack Nutrients",
                "content": "All food business operators must display saturated fat and sugar per 100g.",
                "source": "FSSAI",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "FSSAI" in data["title_hi"]
        assert len(data["impacted_entities"]) > 0
        assert data["action_required"] is not None
