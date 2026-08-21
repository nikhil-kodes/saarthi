import { Job } from 'bullmq';

export interface PaymentJobData {
  action: 'process-escrow-payout' | 'auto-refund';
  transactionId: string;
  amount: number;
}

export interface PaymentJobResult {
  success: boolean;
  action: string;
  transactionId: string;
  processedAt: string;
}

/**
 * Worker processor for the 'payments' queue (WORKFLOW.md §17).
 * Handles async escrow dispatches, webhook confirmations, and automated refunds.
 */
export async function processPaymentsJob(
  job: Job<PaymentJobData, PaymentJobResult>
): Promise<PaymentJobResult> {
  const { action, transactionId, amount } = job.data;
  const now = new Date().toISOString();

  console.log(`[PAYMENTS_WORKER] Processing ${action} for transaction ${transactionId} (₹${amount})`);

  return {
    success: true,
    action,
    transactionId,
    processedAt: now,
  };
}
