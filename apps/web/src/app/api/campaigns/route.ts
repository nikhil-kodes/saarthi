import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { CreatorsService } from '@/lib/services/creators';
import { createCampaignSchema } from '@saarthi/validation';

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

    const campaigns = await CreatorsService.listCampaigns(businessId);
    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_CAMPAIGNS_FAILED', message: error.message } },
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

    const body = await request.json();
    const validated = createCampaignSchema.safeParse({ ...body, brandBusinessId: businessId });
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid campaign payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const campaign = await CreatorsService.createCampaign(
      session.user.id,
      businessId,
      validated.data
    );

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_CAMPAIGN_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
