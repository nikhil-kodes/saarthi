import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { MarketplaceService } from '@/lib/services/marketplace';
import { submitMarketplaceQuoteSchema } from '@saarthi/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rfqId } = await params;
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
    const validated = submitMarketplaceQuoteSchema.safeParse({ ...body, rfqId });
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid quote submission payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const quote = await MarketplaceService.submitQuote(
      session.user.id,
      businessId,
      validated.data
    );

    return NextResponse.json(
      {
        success: true,
        data: quote,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SUBMIT_QUOTE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
