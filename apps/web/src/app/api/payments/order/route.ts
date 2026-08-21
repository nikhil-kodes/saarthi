import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { PaymentsService } from '@/lib/services/payments';
import { createPaymentOrderSchema } from '@saarthi/validation';

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
    const validated = createPaymentOrderSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid payment order request',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const order = await PaymentsService.createOrder(session.user.id, validated.data);
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ORDER_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
