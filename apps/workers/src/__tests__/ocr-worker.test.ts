import { describe, it, expect } from 'vitest';
import { processOCRJob } from '../processors/ocr';
import { Job } from 'bullmq';

describe('OCR Worker Processor', () => {
  it('should detect GST authority and demand for GST file', async () => {
    const mockJob = {
      data: {
        action: 'extract-and-parse',
        documentId: 'doc-gst-1',
        fileName: 'notice_gst.pdf',
        businessId: 'bus-1'
      }
    } as Job<any, any>;

    const result = await processOCRJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.documentId).toBe('doc-gst-1');
    expect(result.authorityDetected).toContain('GST');
    expect(result.demandDetected).toBeGreaterThan(0);
  });

  it('should process generic files', async () => {
    const mockJob = {
      data: {
        action: 'extract-and-parse',
        documentId: 'doc-gen-2',
        fileName: 'unknown_notice.pdf',
        businessId: 'bus-1'
      }
    } as Job<any, any>;

    const result = await processOCRJob(mockJob);
    expect(result.success).toBe(true);
    expect(result.documentId).toBe('doc-gen-2');
    expect(result.authorityDetected).toBe('Statutory Regulatory Authority');
    expect(result.demandDetected).toBe(0.0);
  });
});
