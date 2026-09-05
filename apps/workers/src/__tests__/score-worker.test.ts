import { describe, it, expect } from 'vitest';
import { processScoreJob } from '../processors/score';
import { Job } from 'bullmq';

describe('Score Worker Processor', () => {
  it('should recompute score for business', async () => {
    const mockJob = {
      data: {
        businessId: 'bus-123',
        triggeredBy: 'filing_recorded'
      }
    } as Job<any, any>;

    const result = await processScoreJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.businessId).toBe('bus-123');
    expect(result.score).toBeGreaterThan(0);
    expect(result.grade).toBeDefined();
  });
});
