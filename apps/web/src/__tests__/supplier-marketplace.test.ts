import { describe, it, expect } from 'vitest';
import {
  createSupplierProductSchema,
  createMarketplaceRFQSchema,
  submitMarketplaceQuoteSchema,
  acceptMarketplaceQuoteSchema,
} from '@saarthi/validation';

describe('Supplier Marketplace Schemas & Escrow Workflow', () => {
  it('should validate supplier product creation inputs', () => {
    const valid = createSupplierProductSchema.safeParse({
      title: '5-Ply Corrugated Packaging Boxes',
      description: 'Industrial grade 150 GSM corrugated cardboard shipping boxes.',
      category: 'packaging',
      unit: 'box',
      unitPrice: 28.5,
      hsnCode: '48191010',
      gstRate: 18,
      minOrderQuantity: 500,
      leadTimeDays: 5,
    });
    expect(valid.success).toBe(true);
  });

  it('should validate RFQ creation with credit score gate', () => {
    const valid = createMarketplaceRFQSchema.safeParse({
      title: 'Bulk Corrugated Shipping Boxes 5000 pcs',
      category: 'packaging',
      description: 'Need 5000 units delivered to Noida Sector 62.',
      requiredQuantity: 5000,
      unit: 'box',
      targetBudget: 140000,
      deliveryPincode: '201301',
      minComplianceScore: 700,
      expiresInDays: 14,
    });
    expect(valid.success).toBe(true);
  });

  it('should reject RFQs with invalid PIN codes', () => {
    const invalid = createMarketplaceRFQSchema.safeParse({
      title: 'Bulk Packaging',
      category: 'packaging',
      description: 'Testing invalid pin',
      requiredQuantity: 100,
      unit: 'box',
      deliveryPincode: '012345', // Starts with 0
      minComplianceScore: 600,
      expiresInDays: 14,
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate supplier quote submission', () => {
    const valid = submitMarketplaceQuoteSchema.safeParse({
      rfqId: '123e4567-e89b-12d3-a456-426614174000',
      unitPrice: 27.5,
      totalAmount: 137500,
      validityDays: 15,
      deliveryDays: 5,
      notes: 'Includes door delivery freight in NCR.',
    });
    expect(valid.success).toBe(true);
  });
});
