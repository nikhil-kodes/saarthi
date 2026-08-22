from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
from app.config import settings

router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    user_id: str
    business_id: Optional[str] = None
    locale: str = "en"
    business_context: Optional[Dict[str, Any]] = None
    memory_context: Optional[str] = None
    conversation_history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = []
    confidence_score: float

@router.post("/completions", response_model=ChatResponse)
async def chat_completions(req: ChatRequest):
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    business_info = ""
    if req.business_context:
        legal_name = req.business_context.get('legal_name', 'Unknown')
        sector = req.business_context.get('sector', 'Unknown')
        state = req.business_context.get('state', 'Unknown')
        turnover = req.business_context.get('turnover_band', 'Unknown')
        gstin = req.business_context.get('gstin', 'Not provided')
        business_info = f"Business Context: Name: {legal_name}, Sector: {sector}, State: {state}, Turnover: {turnover}, GSTIN: {gstin}\n"
    
    memory_info = f"Memory Context: {req.memory_context}\n" if req.memory_context else ""

    guardrail_msg = (
        "I'm Saarthi, your MSME compliance assistant. I can only help with compliance, taxation, licensing, and government schemes. Please ask me about these topics."
        if req.locale == "en" else
        "मैं साथी हूँ, आपका एमएसएमई अनुपालन सहायक। मैं केवल अनुपालन, कराधान, लाइसेंसिंग और सरकारी योजनाओं में मदद कर सकता हूँ। कृपया मुझसे इन विषयों के बारे में पूछें।"
    )

    system_prompt = f"""You are the 'Saarthi Compliance Copilot' for Indian MSMEs.
Your role is to assist with compliance, taxation (GST, Income Tax), licensing (FSSAI, Udyam), labor laws (EPF, ESI), MSME regulations, government schemes, and statutory notices.
{business_info}
{memory_info}

Strict Rules:
1. ONLY answer questions related to the above topics.
2. If the user asks an out-of-bounds question, you MUST reply exactly with: "{guardrail_msg}"
3. Reply in {"Hindi" if req.locale == "hi" else "English"}.
4. Be concise and professional.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Append history
    for msg in req.conversation_history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    
    # Append current query
    messages.append({"role": "user", "content": req.query})

    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "HTTP-Referer": "https://saarthi.example.com",
                    "X-Title": "Saarthi Copilot"
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": messages,
                    "temperature": 0.2
                },
                timeout=30.0
            )
            res.raise_for_status()
            data = res.json()
            answer = data["choices"][0]["message"]["content"]
            
            # Simple mock for sources and confidence since we're just calling an LLM
            sources = []
            confidence_score = 0.95
            
            return ChatResponse(
                response=answer,
                sources=sources,
                confidence_score=confidence_score
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
