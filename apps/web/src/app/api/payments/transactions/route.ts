import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { PaymentsService } from '@/lib/services/payments';

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

    const transactions = await PaymentsService.listTransactions(businessId);
    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_TRANSACTIONS_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
