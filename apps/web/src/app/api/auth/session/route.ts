import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';

export async function GET() {
  try {
    const session = await AuthService.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No active session found',
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SESSION_ERROR',
          message: error.message || 'Failed to retrieve session',
        },
      },
      { status: 500 }
    );
  }
}
