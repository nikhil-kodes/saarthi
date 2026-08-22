import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';
import { updateNoticeStatusSchema } from '@saarthi/validation';

import { getNoticeFromStore, saveNoticeToStore, DEMO_NOTICES } from '../route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Try DB lookup if session is active
    const session = await AuthService.getSession();
    if (session?.user) {
      try {
        const notice = await NoticeService.getNoticeById(id);
        if (notice) {
          return NextResponse.json({
            success: true,
            data: notice,
          });
        }
      } catch (e) {
        // Fallback to store
      }
    }

    // 2. Check in-memory global notice registry
    const storedNotice = getNoticeFromStore(id);
    if (storedNotice) {
      return NextResponse.json({
        success: true,
        data: storedNotice,
      });
    }

    // 3. Fallback matching
    const matchedDemo = DEMO_NOTICES.find((n) => n.id === id || n.file_name === id || n.fileName === id) || DEMO_NOTICES[0];
    return NextResponse.json({
      success: true,
      data: matchedDemo,
    });
  } catch (error: any) {
    const matchedDemo = DEMO_NOTICES[0];
    return NextResponse.json({
      success: true,
      data: matchedDemo,
    });
  }
}


export async function PATCH(
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
    const body = await request.json();
    const validated = updateNoticeStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid notice update payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const updated = await NoticeService.updateNotice(session.user.id, id, validated.data);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_NOTICE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
