import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { PaymentsService } from '@/lib/services/payments';
import { verifyPaymentSchema } from '@saarthi/validation';

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
    const validated = verifyPaymentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid payment verification payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const transaction = await PaymentsService.verifyAndCapture(session.user.id, validated.data);
    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'VERIFY_PAYMENT_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
