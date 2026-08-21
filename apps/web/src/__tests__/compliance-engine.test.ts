import { describe, it, expect } from 'vitest';
import { ComplianceService } from '../lib/services/compliance';
import type { Business, ComplianceRequirement } from '@saarthi/shared-types';

describe('Compliance Applicability Rules Engine', () => {
  const baseBusiness: Business = {
    id: 'b1111111-1111-1111-1111-111111111111',
    legalName: 'Agra Footwear & Leather Works Pvt Ltd',
    tradeName: 'Agra Soles',
    sector: 'Leather & Footwear',
    jurisdictionCountry: 'IN',
    jurisdictionState: 'UP',
    employeeCountBand: '20-49',
    turnoverBand: 'small',
    investmentBand: null,
    gstin: '09AAACA1234F1Z5',
    udyamNumber: 'UDYAM-UP-01-0009999',
    fssaiNumber: null,
    pan: 'AAACA1234F',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const gstRequirement: ComplianceRequirement = {
    id: 'r1111111-1111-1111-1111-111111111111',
    code: 'GST_GSTR1_MONTHLY',
    title: 'GSTR-1 Monthly Return',
    description: 'Monthly outward supplies return.',
    category: 'taxation',
    actName: 'CGST Act, 2017',
    jurisdictionCountry: 'IN',
    jurisdictionState: null,
    applicabilityRules: { has_gstin: true },
    frequency: 'monthly',
    dueDayOffset: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const upShopsRequirement: ComplianceRequirement = {
    id: 'r2222222-2222-2222-2222-222222222222',
    code: 'UP_SHOPS_ANNUAL',
    title: 'UP Shops & Establishments Annual Renewal',
    description: 'Annual renewal for UP premises.',
    category: 'labor_and_employment',
    actName: 'UP Shops and Establishments Act, 1962',
    jurisdictionCountry: 'IN',
    jurisdictionState: 'UP',
    applicabilityRules: { jurisdiction_state: 'UP' },
    frequency: 'annual',
    dueDayOffset: 31,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const fssaiRequirement: ComplianceRequirement = {
    id: 'r3333333-3333-3333-3333-333333333333',
    code: 'FSSAI_ANNUAL_D1',
    title: 'FSSAI Form D-1',
    description: 'Annual return for food businesses.',
    category: 'industry_specific',
    actName: 'FSSAI Act, 2006',
    jurisdictionCountry: 'IN',
    jurisdictionState: null,
    applicabilityRules: { sector: 'Food Processing & Confectionery' },
    frequency: 'annual',
    dueDayOffset: 61,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const epfRequirement: ComplianceRequirement = {
    id: 'r4444444-4444-4444-4444-444444444444',
    code: 'EPF_MONTHLY_ECR',
    title: 'EPF Monthly ECR',
    description: 'EPF monthly filing for units with 20+ staff.',
    category: 'labor_and_employment',
    actName: 'EPF Act, 1952',
    jurisdictionCountry: 'IN',
    jurisdictionState: null,
    applicabilityRules: { min_employees: 20 },
    frequency: 'monthly',
    dueDayOffset: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should evaluate GST requirement as applicable when business has GSTIN', () => {
    expect(ComplianceService.evaluateApplicability(baseBusiness, gstRequirement)).toBe(true);
  });

  it('should evaluate GST requirement as not applicable when business lacks GSTIN', () => {
    const unreg = { ...baseBusiness, gstin: null };
    expect(ComplianceService.evaluateApplicability(unreg, gstRequirement)).toBe(false);
  });

  it('should evaluate UP State requirement as applicable for UP entities', () => {
    expect(ComplianceService.evaluateApplicability(baseBusiness, upShopsRequirement)).toBe(true);
  });

  it('should evaluate UP State requirement as not applicable for non-UP entities', () => {
    const mhBusiness = { ...baseBusiness, jurisdictionState: 'MH' };
    expect(ComplianceService.evaluateApplicability(mhBusiness, upShopsRequirement)).toBe(false);
  });

  it('should evaluate FSSAI requirement as not applicable for leather manufacturing entities', () => {
    expect(ComplianceService.evaluateApplicability(baseBusiness, fssaiRequirement)).toBe(false);
  });

  it('should evaluate FSSAI requirement as applicable for food processing entities', () => {
    const foodBusiness = { ...baseBusiness, sector: 'Food Processing & Confectionery' };
    expect(ComplianceService.evaluateApplicability(foodBusiness, fssaiRequirement)).toBe(true);
  });

  it('should evaluate EPF as applicable for 20+ employees', () => {
    expect(ComplianceService.evaluateApplicability(baseBusiness, epfRequirement)).toBe(true);
  });

  it('should evaluate EPF as not applicable for micro-units with 1-9 employees', () => {
    const microBusiness = { ...baseBusiness, employeeCountBand: '1-9' };
    expect(ComplianceService.evaluateApplicability(microBusiness, epfRequirement)).toBe(false);
  });
});
