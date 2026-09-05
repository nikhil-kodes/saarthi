import { describe, it, expect } from 'vitest';
import { processPaymentsJob } from '../processors/payments';
import { Job } from 'bullmq';

describe('Payments Worker Processor', () => {
  it('should process payments job', async () => {
    const mockJob = {
      data: {
        action: 'process-escrow-payout',
        transactionId: 'txn-1',
        amount: 5000
      }
    } as Job<any, any>;

    const result = await processPaymentsJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.action).toBe('process-escrow-payout');
    expect(result.transactionId).toBe('txn-1');
  });
});
