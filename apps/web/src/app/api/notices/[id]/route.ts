import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';
import { updateNoticeStatusSchema } from '@saarthi/validation';

export async function GET(
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

    return NextResponse.json({
      success: true,
      data: notice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'GET_NOTICE_FAILED', message: error.message } },
      { status: 500 }
    );
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
