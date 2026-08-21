import { describe, it, expect } from 'vitest';
import {
  exportComplianceDossierSchema,
  listAuditLogsQuerySchema,
} from '@saarthi/validation';

describe('Admin, Security & CA Partner Dossier Export', () => {
  it('should validate compliance dossier export request schema', () => {
    const valid = exportComplianceDossierSchema.safeParse({
      businessId: '123e4567-e89b-12d3-a456-426614174000',
      format: 'json',
      includeNotices: true,
      includeScore: true,
    });
    expect(valid.success).toBe(true);
  });

  it('should reject dossier export with invalid business ID', () => {
    const invalid = exportComplianceDossierSchema.safeParse({
      businessId: 'not-a-uuid',
      format: 'json',
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate audit logs query parameters', () => {
    const valid = listAuditLogsQuerySchema.safeParse({
      action: 'RECORD_FILING',
      limit: 25,
    });
    expect(valid.success).toBe(true);
  });
});
