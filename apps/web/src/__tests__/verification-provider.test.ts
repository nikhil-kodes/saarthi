import { describe, it, expect } from 'vitest';
import { MockVerificationProvider } from '../lib/providers/verification/mock-provider';

describe('MockVerificationProvider', () => {
  const provider = new MockVerificationProvider();

  it('should identify itself as a mock provider with isMock: true', () => {
    expect(provider.name).toBe('MockVerificationProvider');
    expect(provider.isMock).toBe(true);
  });

  it('should verify all provided Indian registration identifiers deterministically', async () => {
    const request = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      legalName: 'Demo Foods Private Limited',
      pan: 'AAACD1234F',
      gstin: '09AAACD1234F1Z5',
      udyamNumber: 'UDYAM-UP-01-0012345',
      fssaiNumber: '10012345678901',
      sector: 'Food Processing',
      jurisdictionState: 'UP',
    };

    const result = await provider.verify(request);

    expect(result.status).toBe('verified');
    expect(result.isMock).toBe(true);
    expect(result.provider).toBe('MockVerificationProvider');
    expect(result.checks).toHaveLength(4);

    const checkTypes = result.checks.map((c) => c.type);
    expect(checkTypes).toContain('pan');
    expect(checkTypes).toContain('gstin');
    expect(checkTypes).toContain('udyam');
    expect(checkTypes).toContain('fssai');

    for (const check of result.checks) {
      expect(check.status).toBe('verified');
      expect(check.verifiedAt).toBeDefined();
      expect(check.message).toBeDefined();
    }
  });

  it('should return unverified if no identifiers are provided', async () => {
    const request = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      legalName: 'Unregistered Firm',
      sector: 'Retail',
      jurisdictionState: 'UP',
    };

    const result = await provider.verify(request);

    expect(result.status).toBe('unverified');
    expect(result.failureReason).toBeDefined();
    expect(result.checks[0]?.status).toBe('skipped');
  });

  it('should verify successfully even if only PAN or GSTIN is supplied', async () => {
    const request = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      legalName: 'Minimal Tech MSME',
      pan: 'AAACT5678G',
      sector: 'IT Services',
      jurisdictionState: 'UP',
    };

    const result = await provider.verify(request);

    expect(result.status).toBe('verified');
    expect(result.checks).toHaveLength(1);
    expect(result.checks[0]?.type).toBe('pan');
    expect(result.checks[0]?.status).toBe('verified');
  });
});
