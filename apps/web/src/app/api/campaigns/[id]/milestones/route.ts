import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { CreatorsService } from '@/lib/services/creators';
import { submitMilestoneDeliverableSchema } from '@saarthi/validation';

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

    const body = await request.json();
    const validated = submitMilestoneDeliverableSchema.safeParse({
      ...body,
      milestoneId,
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid milestone submission payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const milestone = await CreatorsService.submitMilestoneDeliverable(
      session.user.id,
      validated.data
    );

    return NextResponse.json({
      success: true,
      data: milestone,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SUBMIT_MILESTONE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
