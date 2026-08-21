import { describe, it, expect } from 'vitest';
import { processComplianceJob } from '../processors/compliance';
import { Job } from 'bullmq';

describe('Compliance Worker Processor', () => {
  it('should execute daily-scan job and return processed count and timestamp', async () => {
    const mockJob = {
      data: {
        action: 'daily-scan',
      },
    } as Job<any, any>;

    const result = await processComplianceJob(mockJob);

    expect(result.success).toBe(true);
    expect(result.action).toBe('daily-scan');
    expect(result.processedCount).toBeGreaterThan(0);
    expect(result.scannedAt).toBeDefined();
  });

  it('should execute generate-instances job for a business', async () => {
    const mockJob = {
      data: {
        action: 'generate-instances',
        businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        year: 2026,
      },
    } as Job<any, any>;

    const result = await processComplianceJob(mockJob);

    expect(result.success).toBe(true);
    expect(result.action).toBe('generate-instances');
    expect(result.processedCount).toBeGreaterThan(0);
  });

  it('should throw error for unsupported action', async () => {
    const mockJob = {
      data: {
        action: 'unsupported-action' as any,
      },
    } as Job<any, any>;

    await expect(processComplianceJob(mockJob)).rejects.toThrow('Unknown compliance action');
  });
});
