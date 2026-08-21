import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';
import { createNoticeUploadSchema } from '@saarthi/validation';

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const businessId = session.activeMembership?.businessId;
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ACTIVE_BUSINESS', message: 'No active business membership' } },
        { status: 400 }
      );
    }

    const notices = await NoticeService.listNotices(businessId);
    return NextResponse.json({
      success: true,
      data: notices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_NOTICES_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createNoticeUploadSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid notice upload payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = await NoticeService.uploadAndParseNotice(session.user.id, validated.data);
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_NOTICE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
