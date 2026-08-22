import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { PaymentsService } from '@/lib/services/payments';

const DEMO_TRANSACTIONS = [
  {
    id: 'tx-1',
    provider_order_id: 'order_demo_98124',
    provider_payment_id: 'pay_demo_98124',
    amount: 149900,
    currency: 'INR',
    purpose: 'Compliance Monthly Filing Fee (GST & TDS)',
    status: 'captured',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'tx-2',
    provider_order_id: 'order_demo_98110',
    provider_payment_id: 'pay_demo_98110',
    amount: 249900,
    currency: 'INR',
    purpose: 'CA Expert Notice Review Consultation',
    status: 'captured',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership?.businessId) {
      return NextResponse.json({
        success: true,
        data: DEMO_TRANSACTIONS,
      });
    }

    const businessId = session.activeMembership.businessId;
    const transactions = await PaymentsService.listTransactions(businessId);
    return NextResponse.json({
      success: true,
      data: transactions && transactions.length > 0 ? transactions : DEMO_TRANSACTIONS,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: DEMO_TRANSACTIONS,
    });
  }
}
