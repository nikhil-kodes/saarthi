import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { ScoreService } from '@/lib/services/score';
import { createScoreConsentSchema } from '@saarthi/validation';

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
    const validated = createScoreConsentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid score consent payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const grant = await ScoreService.createConsentGrant(session.user.id, validated.data);
    return NextResponse.json(
      {
        success: true,
        data: grant,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_CONSENT_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
