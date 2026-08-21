import { describe, it, expect } from 'vitest';
import {
  createFilingRecordSchema,
  listComplianceInstancesQuerySchema,
  generateComplianceInstancesSchema,
} from '@saarthi/validation';

describe('Compliance Filing & Query Validation', () => {
  it('should validate filing submission with acknowledgement number and notes', () => {
    const payload = {
      instanceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      acknowledgementNumber: 'ARN-AA0904240123456',
      documentUrl: 'https://gst.gov.in/receipts/arn123.pdf',
      notes: 'Paid on time via SBI Net Banking',
    };
    const parsed = createFilingRecordSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('should validate minimal filing submission with just instanceId', () => {
    const minimal = {
      instanceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    };
    const parsed = createFilingRecordSchema.safeParse(minimal);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid instance UUID', () => {
    const invalid = {
      instanceId: 'not-a-valid-uuid',
    };
    expect(createFilingRecordSchema.safeParse(invalid).success).toBe(false);
  });

  it('should validate query filters with valid status and category', () => {
    const query = {
      status: 'due_soon',
      category: 'taxation',
      fromDate: '2026-01-01',
      toDate: '2026-12-31',
    };
    const parsed = listComplianceInstancesQuerySchema.safeParse(query);
    expect(parsed.success).toBe(true);
  });

  it('should validate instance generation payload with valid year', () => {
    const payload = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      year: 2026,
    };
    const parsed = generateComplianceInstancesSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });
});
