import { describe, it, expect } from 'vitest';
import { processRegulatoryJob } from '../processors/regulatory';
import { Job } from 'bullmq';

describe('Regulatory Worker Processor', () => {
  it('should handle crawl-updates', async () => {
    const mockJob = {
      data: { action: 'crawl-updates' }
    } as Job<any, any>;

    const result = await processRegulatoryJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.action).toBe('crawl-updates');
  });

  it('should handle ingest-circular', async () => {
    const mockJob = {
      data: { action: 'ingest-circular', source: 'CBIC' }
    } as Job<any, any>;

    const result = await processRegulatoryJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.action).toBe('ingest-circular');
  });

  it('should throw on invalid action', async () => {
    const mockJob = {
      data: { action: 'invalid-action' as any }
    } as Job<any, any>;

    await expect(processRegulatoryJob(mockJob)).rejects.toThrow('Unknown regulatory action');
  });
});
