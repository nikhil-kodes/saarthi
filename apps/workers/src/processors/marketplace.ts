import { Job } from 'bullmq';

export interface MarketplaceJobData {
  action: 'notify-rfq-matches' | 'escrow-lock' | 'escrow-release';
  rfqId?: string;
  orderId?: string;
  amount?: number;
}

export interface MarketplaceJobResult {
  success: boolean;
  action: string;
  processedAt: string;
}

/**
 * Worker processor for the 'marketplace' queue (PRD.md §12, WORKFLOW.md §17).
 */
export async function processMarketplaceJob(
  job: Job<MarketplaceJobData, MarketplaceJobResult>
): Promise<MarketplaceJobResult> {
  const { action, rfqId, orderId, amount } = job.data;
  const now = new Date().toISOString();

  console.log(`[MARKETPLACE_WORKER] Processing ${action} for order ${orderId || rfqId} (₹${amount || 0})`);

  return {
    success: true,
    action,
    processedAt: now,
  };
}
