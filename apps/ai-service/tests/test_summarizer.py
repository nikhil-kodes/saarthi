import pytest
from app.services.summarizer import CircularSummarizer

@pytest.mark.asyncio
async def test_summarize_circular_fallback_gst():
    # Will use fallback if openrouter api key is not set, which is typical in CI
    summary = await CircularSummarizer.summarize_circular_ai(
        title="Mandatory GST e-Invoice",
        content="ITC matching with GSTR-2B is mandatory.",
        source="CBIC"
    )
    assert summary.risk_level == "high"
    assert "ITC" in summary.summary_en or "GST" in summary.summary_en

@pytest.mark.asyncio
async def test_summarize_circular_fallback_fssai():
    summary = await CircularSummarizer.summarize_circular_ai(
        title="FSSAI Guidelines",
        content="Food safety display required.",
        source="FSSAI"
    )
    assert summary.risk_level == "medium"
    assert "FSSAI" in summary.summary_en or "Food" in summary.summary_en
