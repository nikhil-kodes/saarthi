import type {
  PaymentOrderRequest,
  PaymentOrderResult,
  PaymentVerificationRequest,
  PaymentRefundResult,
} from '@saarthi/shared-types';

export interface PaymentProvider {
  createOrder(request: PaymentOrderRequest): Promise<PaymentOrderResult>;
  verifyPayment(request: PaymentVerificationRequest): Promise<boolean>;
  refundPayment(paymentId: string, amount?: number): Promise<PaymentRefundResult>;
}
