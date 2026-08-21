import { NextResponse } from 'next/server';
import { ScoreService } from '@/lib/services/score';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const verified = await ScoreService.getScoreByConsentToken(token);

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_OR_EXPIRED_TOKEN',
            message: 'This score verification link is invalid or has expired',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: verified,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'VERIFY_TOKEN_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
