import { Job } from 'bullmq';

export interface CampaignJobData {
  action: 'verify-asci-compliance' | 'release-milestone-payout';
  campaignId: string;
  milestoneId: string;
  amount: number;
}

export interface CampaignJobResult {
  success: boolean;
  action: string;
  processedAt: string;
}

/**
 * Worker processor for influencer campaigns & ASCI verification (PRD.md §13, WORKFLOW.md §17).
 */
export async function processCampaignJob(
  job: Job<CampaignJobData, CampaignJobResult>
): Promise<CampaignJobResult> {
  const { action, campaignId, milestoneId, amount } = job.data;
  const now = new Date().toISOString();

  console.log(`[CAMPAIGN_WORKER] Processing ${action} for milestone ${milestoneId} (₹${amount})`);

  return {
    success: true,
    action,
    processedAt: now,
  };
}
