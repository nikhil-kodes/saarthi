import { describe, it, expect } from 'vitest';
import { processMarketplaceJob } from '../processors/marketplace';
import { Job } from 'bullmq';

describe('Marketplace Worker Processor', () => {
  it('should process marketplace job', async () => {
    const mockJob = {
      data: {
        action: 'notify-rfq-matches',
        rfqId: 'rfq-1'
      }
    } as Job<any, any>;

    const result = await processMarketplaceJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.action).toBe('notify-rfq-matches');
  });
});
