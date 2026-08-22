from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ocr_service import OCRService
from app.services.notice_parser import NoticeParser, ParsedNoticeResult

router = APIRouter(prefix="/api/v1/ocr", tags=["Notice OCR & Plain-Language Parser"])


class NoticeParseRequest(BaseModel):
    file_name: str
    raw_content: Optional[str] = None
    legal_name: Optional[str] = "Enterprise"


class ReplyLetterRequest(BaseModel):
    notice_id: Optional[str] = None
    authority: str
    notice_number: Optional[str] = None
    legal_name: str
    grounds: str


@router.post("/parse", response_model=ParsedNoticeResult)
async def parse_uploaded_notice(request: NoticeParseRequest) -> ParsedNoticeResult:
    """Extracts OCR text and parses statutory notice into structured financial demand,

    deadlines, and bilingual plain-language explanation.
    """
    try:
        extracted_text = OCRService.extract_text(
            file_name=request.file_name,
            raw_content=request.raw_content or "",
        )
        return await NoticeParser.parse_notice_text_ai(
            text=extracted_text,
            legal_name=request.legal_name or "Enterprise",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR parsing failed: {str(e)}")


@router.post("/reply-letter")
async def generate_custom_reply(request: ReplyLetterRequest):
    """Generates customized formal reply letter with statutory legal provisions."""
    letter = (
        f"To,\n"
        f"The Authorized Officer,\n"
        f"{request.authority}\n\n"
        f"Date: 20-02-2026\n"
        f"Subject: Formal Written Reply to Notice (Ref: {request.notice_number or 'N/A'})\n\n"
        f"Respected Sir/Madam,\n\n"
        f"We, {request.legal_name}, hereby submit our point-by-point reply on the following factual and statutory grounds:\n\n"
        f"{request.grounds}\n\n"
        f"We request you to kindly place this reply on record and drop further proposed proceedings.\n\n"
        f"Yours faithfully,\n"
        f"For {request.legal_name}\n"
        f"Authorized Signatory"
    )
    return {"success": True, "letter": letter}
