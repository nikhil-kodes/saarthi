import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { MarketplaceService } from '@/lib/services/marketplace';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quoteId } = await params;
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const order = await MarketplaceService.acceptQuoteAndCreateOrder(
      session.user.id,
      quoteId
    );

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'ACCEPT_QUOTE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
