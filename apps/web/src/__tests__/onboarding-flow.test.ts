import { describe, it, expect } from 'vitest';
import { createBusinessSchema } from '@saarthi/validation';

describe('Onboarding Flow Validation', () => {
  it('should validate complete Step 1 & 2 onboarding payload', () => {
    const fullPayload = {
      legalName: 'Demo Foods MSME Private Limited',
      tradeName: 'Demo Foods',
      sector: 'Food Processing & Confectionery',
      jurisdictionCountry: 'IN',
      jurisdictionState: 'UP',
      employeeCountBand: '20-49',
      turnoverBand: 'small',
      pan: 'AAACD1234F',
      gstin: '09AAACD1234F1Z5',
      udyamNumber: 'UDYAM-UP-01-0012345',
      fssaiNumber: '10012345678901',
    };

    const parsed = createBusinessSchema.safeParse(fullPayload);
    expect(parsed.success).toBe(true);
  });

  it('should allow optional registrations during initial wizard setup', () => {
    const minimalPayload = {
      legalName: 'Simple Agra Footwear Unit',
      sector: 'Leather & Footwear',
      jurisdictionCountry: 'IN',
      jurisdictionState: 'UP',
    };

    const parsed = createBusinessSchema.safeParse(minimalPayload);
    expect(parsed.success).toBe(true);
  });

  it('should default country to IN and state to UP when omitted', () => {
    const minimalPayload = {
      legalName: 'Simple Agra Footwear Unit',
      sector: 'Leather & Footwear',
    };

    const parsed = createBusinessSchema.safeParse(minimalPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.jurisdictionCountry).toBe('IN');
      expect(parsed.data.jurisdictionState).toBe('UP');
    }
  });
});
