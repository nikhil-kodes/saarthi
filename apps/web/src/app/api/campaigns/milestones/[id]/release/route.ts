import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { CreatorsService } from '@/lib/services/creators';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const milestone = await CreatorsService.releaseMilestonePayout(
      session.user.id,
      milestoneId
    );

    return NextResponse.json({
      success: true,
      data: milestone,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'RELEASE_PAYOUT_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
