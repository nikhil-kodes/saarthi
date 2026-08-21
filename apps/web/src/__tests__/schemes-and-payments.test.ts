import { describe, it, expect } from 'vitest';
import { SchemesService } from '../lib/services/schemes';
import { MockPaymentProvider } from '../lib/providers/payment/mock';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  applySchemeSchema,
} from '@saarthi/validation';
import type { GovernmentScheme, Business } from '@saarthi/shared-types';

describe('Schemes Eligibility & Payment Gateway', () => {
  const sampleBusiness: Partial<Business> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    legalName: 'Purvanchal Agro Foods',
    jurisdictionState: 'UP',
    turnoverBand: 'small',
    udyamNumber: 'UDYAM-UP-01-0012345',
    gstin: '09AAACS1234F1Z5',
  };

  const upScheme: GovernmentScheme = {
    id: 'scheme-1',
    code: 'UP_MSME_CAPITAL',
    title: 'UP MSME Capital Subsidy',
    ministry: 'Directorate of Industries, UP',
    description: 'Capital investment subsidy',
    eligibilityCriteria: {
      jurisdiction_state: 'UP',
      enterprise_types: ['micro', 'small'],
      requires_udyam: true,
    },
    maxBenefitAmount: 40000000,
    benefitType: 'capital_subsidy',
    jurisdictionState: 'UP',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should evaluate UP MSME scheme as eligible for matching business', () => {
    const result = SchemesService.evaluateEligibility(sampleBusiness, upScheme);
    expect(result.isEligible).toBe(true);
    expect(result.reason).toContain('100% criteria met');
  });

  it('should reject scheme eligibility when state does not match', () => {
    const nonUpBusiness = { ...sampleBusiness, jurisdictionState: 'MH' };
    const result = SchemesService.evaluateEligibility(nonUpBusiness, upScheme);
    expect(result.isEligible).toBe(false);
    expect(result.reason).toContain('Requires operations in UP');
  });

  it('should create and verify mock Razorpay payment orders', async () => {
    const provider = new MockPaymentProvider();
    const order = await provider.createOrder({
      businessId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1499,
      purpose: 'Compliance Filing Fee',
    });

    expect(order.orderId).toContain('order_mock_');
    expect(order.amount).toBe(1499);
    expect(order.isMock).toBe(true);

    const verified = await provider.verifyPayment({
      orderId: order.orderId,
      paymentId: 'pay_mock_123',
      signature: 'valid_signature_hash',
    });
    expect(verified).toBe(true);
  });

  it('should process instant escrow refunds', async () => {
    const provider = new MockPaymentProvider();
    const refund = await provider.refundPayment('pay_mock_123', 1499);
    expect(refund.refundId).toContain('rfnd_mock_');
    expect(refund.status).toBe('processed');
  });
});
