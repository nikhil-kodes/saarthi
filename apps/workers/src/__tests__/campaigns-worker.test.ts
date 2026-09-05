import { describe, it, expect } from 'vitest';
import { processCampaignJob } from '../processors/campaigns';
import { Job } from 'bullmq';

describe('Campaigns Worker Processor', () => {
  it('should process campaign job', async () => {
    const mockJob = {
      data: {
        action: 'verify-asci-compliance',
        campaignId: 'camp-1',
        milestoneId: 'mile-1',
        amount: 1000
      }
    } as Job<any, any>;

    const result = await processCampaignJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.action).toBe('verify-asci-compliance');
  });
});
