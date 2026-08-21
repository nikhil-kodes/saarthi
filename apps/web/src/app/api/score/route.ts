import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { ScoreService } from '@/lib/services/score';
import { recomputeScoreSchema } from '@saarthi/validation';

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

    let score = await ScoreService.getLatestScore(businessId);
    if (!score) {
      // Automatically compute initial baseline score
      score = await ScoreService.computeScoreForBusiness(session.user.id, businessId);
    }

    return NextResponse.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'GET_SCORE_FAILED', message: error.message } },
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

    const businessId = session.activeMembership?.businessId;
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ACTIVE_BUSINESS', message: 'No active business membership' } },
        { status: 400 }
      );
    }

    const score = await ScoreService.computeScoreForBusiness(session.user.id, businessId);
    return NextResponse.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'RECOMPUTE_SCORE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
