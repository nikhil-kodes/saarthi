import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notice = await NoticeService.getNoticeById(id);

    if (!notice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOTICE_NOT_FOUND', message: 'Notice not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const grounds = body.grounds || '1. All Input Tax Credit claimed was in compliance with Section 16(2).';
    const legalName = session.activeMembership?.business?.legalName || 'Enterprise';

    let draftLetter;
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/v1/ocr/reply-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notice_id: id,
          authority: notice.authority,
          notice_number: notice.noticeNumber,
          legal_name: legalName,
          grounds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        draftLetter = data.letter;
      }
    } catch (e) {
      console.warn('AI reply generation failed, using fallback draft:', e);
    }

    if (!draftLetter) {
      draftLetter =
        `To,\n${notice.authority}\n\n` +
        `Subject: Reply to Notice No. ${notice.noticeNumber || 'N/A'}\n\n` +
        `Respected Sir/Madam,\n\n` +
        `With reference to the notice regarding proposed tax demand, ${legalName} respectfully submits that:\n` +
        `${grounds}\n\n` +
        `We request you to drop the proposed proceedings.\n\n` +
        `Yours faithfully,\nFor ${legalName}`;
    }

    // Save generated draft
    const updated = await NoticeService.updateNotice(session.user.id, id, {
      replyDraftEn: draftLetter,
      status: 'reply_drafted',
    });

    return NextResponse.json({
      success: true,
      data: {
        letter: draftLetter,
        notice: updated,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'REPLY_GENERATION_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
