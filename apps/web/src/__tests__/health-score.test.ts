import { describe, it, expect } from 'vitest';
import { createScoreConsentSchema, recomputeScoreSchema } from '@saarthi/validation';

describe('Compliance Health Score Schemas & Validation', () => {
  it('should validate valid score consent inputs', () => {
    const valid = createScoreConsentSchema.safeParse({
      businessId: '123e4567-e89b-12d3-a456-426614174000',
      granteeName: 'State Bank of India - SME Branch',
      granteeType: 'lender',
      expiresInDays: 30,
    });
    expect(valid.success).toBe(true);
  });

  it('should reject invalid UUIDs for recomputation', () => {
    const invalid = recomputeScoreSchema.safeParse({
      businessId: 'invalid-uuid',
    });
    expect(invalid.success).toBe(false);
  });

  it('should reject empty grantee name', () => {
    const invalid = createScoreConsentSchema.safeParse({
      businessId: '123e4567-e89b-12d3-a456-426614174000',
      granteeName: '',
      granteeType: 'supplier',
    });
    expect(invalid.success).toBe(false);
  });
});
