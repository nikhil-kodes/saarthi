import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import { MockPaymentProvider } from '../providers/payment/mock';
import type {
  PaymentTransaction,
  PaymentOrderResult,
  PaymentRefundResult,
} from '@saarthi/shared-types';
import type {
  CreatePaymentOrderInput,
  VerifyPaymentInput,
  RefundPaymentInput,
} from '@saarthi/validation';

export class PaymentsService {
  private static provider = new MockPaymentProvider();

  /**
   * Creates a payment order and records initialized transaction.
   */
  static async createOrder(
    userId: string,
    input: CreatePaymentOrderInput
  ): Promise<PaymentOrderResult> {
    const order = await this.provider.createOrder({
      businessId: input.businessId,
      amount: input.amount,
      purpose: input.purpose,
      notes: input.notes,
    });

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from('payment_transactions').insert({
      business_id: input.businessId,
      user_id: userId,
      provider: 'razorpay_mock',
      provider_order_id: order.orderId,
      amount: input.amount,
      currency: order.currency,
      status: 'created',
      purpose: input.purpose,
      metadata: input.notes || {},
    });

    if (error) {
      throw new Error(`Failed to initialize payment transaction: ${error.message}`);
    }

    return order;
  }

  /**
   * Verifies signature and marks transaction captured.
   */
  static async verifyAndCapture(
    userId: string,
    input: VerifyPaymentInput
  ): Promise<PaymentTransaction> {
    const isValid = await this.provider.verifyPayment(input);
    if (!isValid) {
      throw new Error('Payment signature verification failed');
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('payment_transactions')
      .update({
        provider_payment_id: input.paymentId,
        status: 'captured',
        updated_at: new Date().toISOString(),
      })
      .eq('provider_order_id', input.orderId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to capture payment record: ${error?.message}`);
    }

    await AuditService.record({
      businessId: data.business_id,
      actorId: userId,
      action: 'PAYMENT_CAPTURED',
      resourceType: 'payment_transaction',
      resourceId: data.id,
      details: {
        orderId: input.orderId,
        paymentId: input.paymentId,
        amount: Number(data.amount),
      },
    });

    return {
      id: data.id,
      businessId: data.business_id,
      userId: data.user_id,
      provider: data.provider,
      providerOrderId: data.provider_order_id,
      providerPaymentId: data.provider_payment_id,
      amount: Number(data.amount),
      currency: data.currency,
      status: data.status,
      purpose: data.purpose,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Executes instant simulated refund and updates transaction.
   */
  static async processRefund(
    userId: string,
    input: RefundPaymentInput
  ): Promise<PaymentRefundResult> {
    const adminSupabase = createAdminClient();

    const { data: transaction, error: txError } = await adminSupabase
      .from('payment_transactions')
      .select('*')
      .eq('id', input.transactionId)
      .single();

    if (txError || !transaction) {
      throw new Error('Payment transaction not found');
    }

    if (transaction.status === 'refunded') {
      throw new Error('Transaction has already been refunded');
    }

    const refundResult = await this.provider.refundPayment(
      transaction.provider_payment_id || transaction.provider_order_id,
      Number(transaction.amount)
    );

    const now = new Date().toISOString();
    await adminSupabase
      .from('payment_transactions')
      .update({
        status: 'refunded',
        refund_id: refundResult.refundId,
        refunded_at: now,
        updated_at: now,
      })
      .eq('id', input.transactionId);

    await AuditService.record({
      businessId: transaction.business_id,
      actorId: userId,
      action: 'PAYMENT_REFUNDED',
      resourceType: 'payment_transaction',
      resourceId: input.transactionId,
      details: {
        refundId: refundResult.refundId,
        amount: refundResult.amount,
        reason: input.reason || 'Escrow refund triggered',
      },
    });

    return refundResult;
  }

  /**
   * Lists payment transactions for a business.
   */
  static async listTransactions(businessId: string): Promise<PaymentTransaction[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      businessId: d.business_id,
      userId: d.user_id,
      provider: d.provider,
      providerOrderId: d.provider_order_id,
      providerPaymentId: d.provider_payment_id,
      amount: Number(d.amount),
      currency: d.currency,
      status: d.status,
      purpose: d.purpose,
      metadata: d.metadata,
      refundId: d.refund_id,
      refundedAt: d.refunded_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }
}
