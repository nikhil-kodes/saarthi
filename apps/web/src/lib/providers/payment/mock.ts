import type { PaymentProvider } from './index';
import type {
  PaymentOrderRequest,
  PaymentOrderResult,
  PaymentVerificationRequest,
  PaymentRefundResult,
} from '@saarthi/shared-types';

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(request: PaymentOrderRequest): Promise<PaymentOrderResult> {
    const orderId = `order_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      orderId,
      amount: request.amount,
      currency: 'INR',
      keyId: 'rzp_test_saarthi_sandbox_key',
      isMock: true,
    };
  }

  async verifyPayment(request: PaymentVerificationRequest): Promise<boolean> {
    // Validates mock signature format
    if (!request.orderId || !request.paymentId || !request.signature) {
      return false;
    }
    return request.signature.length > 5;
  }

  async refundPayment(paymentId: string, amount: number = 0): Promise<PaymentRefundResult> {
    const refundId = `rfnd_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      refundId,
      paymentId,
      amount,
      status: 'processed',
      isMock: true,
    };
  }
}
