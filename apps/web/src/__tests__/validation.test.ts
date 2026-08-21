import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  createBusinessSchema,
  emailSchema,
  passwordSchema,
} from '@saarthi/validation';

describe('Validation Schemas (Auth & Business)', () => {
  describe('Email & Password Validation', () => {
    it('should accept valid email addresses and normalize them', () => {
      const parsed = emailSchema.safeParse('  Owner@Example.COM  ');
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toBe('owner@example.com');
      }
    });

    it('should reject invalid emails', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
      expect(emailSchema.safeParse('').success).toBe(false);
    });

    it('should accept valid passwords meeting complexity requirements', () => {
      expect(passwordSchema.safeParse('SecurePass123').success).toBe(true);
    });

    it('should reject passwords shorter than 8 characters or lacking numbers', () => {
      expect(passwordSchema.safeParse('short1').success).toBe(false);
      expect(passwordSchema.safeParse('alllettersnopass').success).toBe(false);
    });
  });

  describe('Sign Up Schema', () => {
    it('should validate complete sign up payload', () => {
      const validPayload = {
        fullName: 'Rajesh Sharma',
        email: 'rajesh@sharmasweets.in',
        password: 'Password999',
        locale: 'hi',
      };
      const result = signUpSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject sign up with short name or invalid locale', () => {
      const invalid = {
        fullName: 'R',
        email: 'rajesh@sharmasweets.in',
        password: 'Password999',
        locale: 'fr',
      };
      expect(signUpSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Business Creation Schema', () => {
    it('should validate complete business creation payload with Indian registration formats', () => {
      const validBusiness = {
        legalName: 'Sharma Sweets and Snacks Private Limited',
        sector: 'Food / Confectionery',
        jurisdictionCountry: 'IN',
        jurisdictionState: 'UP',
        employeeCountBand: '10-19',
        turnoverBand: 'micro',
        gstin: '09AAACH7409R1ZZ',
        udyamNumber: 'UDYAM-UP-01-0012345',
        fssaiNumber: '10012345678901',
        pan: 'AAACH7409R',
      };
      const result = createBusinessSchema.safeParse(validBusiness);
      expect(result.success).toBe(true);
    });

    it('should accept empty or null registration numbers during initial onboarding', () => {
      const minimalBusiness = {
        legalName: 'New Kirana Store',
        sector: 'Retail Trade',
      };
      const result = createBusinessSchema.safeParse(minimalBusiness);
      expect(result.success).toBe(true);
    });

    it('should reject invalid GSTIN or PAN patterns when provided', () => {
      const invalidGST = {
        legalName: 'Test Biz',
        sector: 'Services',
        gstin: 'invalid-gstin-123',
      };
      expect(createBusinessSchema.safeParse(invalidGST).success).toBe(false);
    });
  });
});
