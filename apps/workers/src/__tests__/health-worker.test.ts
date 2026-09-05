import { describe, it, expect } from 'vitest';
import { processHealthCheck } from '../processors/health';
import { Job } from 'bullmq';

describe('Health Worker Processor', () => {
  it('should process health check and return healthy status', async () => {
    const mockJob = { id: 'job-123' } as Job<any, any>;
    const result = await processHealthCheck(mockJob);
    
    expect(result.status).toBe('healthy');
    expect(result.jobId).toBe('job-123');
    expect(result.timestamp).toBeDefined();
  });
});
