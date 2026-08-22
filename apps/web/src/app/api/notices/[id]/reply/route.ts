import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

import { getNoticeFromStore, saveNoticeToStore, DEMO_NOTICES } from '../../route';


export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const grounds = body.grounds || '1. All statutory records and tax compliance are supported by genuine verifiable documentation.\n2. We request you to kindly drop the proposed penalty proceedings.';
    
    let notice = getNoticeFromStore(id) || DEMO_NOTICES.find((n: any) => n.id === id) || DEMO_NOTICES[0];

    const session = await AuthService.getSession();
    
    if (session?.user) {
      try {
        const dbNotice = await NoticeService.getNoticeById(id);
        if (dbNotice) notice = dbNotice;
      } catch (e) {
        // Fallback
      }
    }

    const legalName = session?.activeMembership?.business?.legalName || 'Apex Enterprises';
    const authority = notice.authority || 'Statutory Regulatory Authority';
    const noticeNo = notice.noticeNumber || notice.notice_number || 'N/A';

    let draftLetter;
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/v1/ocr/reply-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notice_id: id,
          authority: authority,
          notice_number: noticeNo,
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
        `To,\n${authority}\n\n` +
        `Date: 22-02-2026\n` +
        `Subject: Formal Written Reply to Notice (Ref: ${noticeNo})\n\n` +
        `Respected Sir/Madam,\n\n` +
        `We, ${legalName}, hereby submit our point-by-point reply on the following factual and statutory grounds:\n\n` +
        `${grounds}\n\n` +
        `We request you to kindly place this reply on record and drop further proposed proceedings.\n\n` +
        `Yours faithfully,\n` +
        `For ${legalName}\n` +
        `Authorized Signatory`;
    }

    const updatedNotice = {
      ...notice,
      replyDraftEn: draftLetter,
      reply_draft_en: draftLetter,
      status: 'reply_drafted',
    };

    saveNoticeToStore(updatedNotice);

    if (session?.user) {
      try {
        await NoticeService.updateNotice(session.user.id, id, {
          replyDraftEn: draftLetter,
          status: 'reply_drafted',
        });
      } catch (e) {
        // Fallback store updated
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        letter: draftLetter,
        notice: updatedNotice,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'REPLY_GENERATION_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}

