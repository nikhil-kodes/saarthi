import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import type {
  SupplierProduct,
  MarketplaceRFQ,
  MarketplaceQuote,
  MarketplaceOrder,
} from '@saarthi/shared-types';
import type {
  CreateSupplierProductInput,
  CreateMarketplaceRFQInput,
  SubmitMarketplaceQuoteInput,
} from '@saarthi/validation';

export class MarketplaceService {
  /**
   * Lists all active supplier catalog products.
   */
  static async listProducts(category?: string): Promise<SupplierProduct[]> {
    const supabase = await createClient();
    let query = supabase
      .from('supplier_products')
      .select('*, businesses(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      businessId: d.business_id,
      title: d.title,
      titleHi: d.title_hi,
      description: d.description,
      category: d.category,
      unit: d.unit,
      unitPrice: Number(d.unit_price),
      hsnCode: d.hsn_code,
      gstRate: Number(d.gst_rate),
      minOrderQuantity: d.min_order_quantity,
      leadTimeDays: d.lead_time_days,
      isActive: d.is_active,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      business: d.businesses
        ? {
            id: d.businesses.id,
            legalName: d.businesses.legal_name,
            tradeName: d.businesses.trade_name,
            sector: d.businesses.sector,
            jurisdictionCountry: d.businesses.jurisdiction_country,
            jurisdictionState: d.businesses.jurisdiction_state,
            employeeCountBand: d.businesses.employee_count_band,
            turnoverBand: d.businesses.turnover_band,
            investmentBand: d.businesses.investment_band,
            gstin: d.businesses.gstin,
            udyamNumber: d.businesses.udyam_number,
            fssaiNumber: d.businesses.fssai_number,
            pan: d.businesses.pan,
            isVerified: d.businesses.is_verified,
            createdAt: d.businesses.created_at,
            updatedAt: d.businesses.updated_at,
          }
        : undefined,
    }));
  }

  /**
   * Adds a product to supplier catalog.
   */
  static async createProduct(
    userId: string,
    businessId: string,
    input: CreateSupplierProductInput
  ): Promise<SupplierProduct> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('supplier_products')
      .insert({
        business_id: businessId,
        title: input.title,
        title_hi: input.titleHi,
        description: input.description,
        category: input.category,
        unit: input.unit,
        unit_price: input.unitPrice,
        hsn_code: input.hsnCode,
        gst_rate: input.gstRate,
        min_order_quantity: input.minOrderQuantity,
        lead_time_days: input.leadTimeDays,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create product: ${error?.message}`);
    }

    await AuditService.record({
      businessId,
      actorId: userId,
      action: 'MARKETPLACE_PRODUCT_CREATED',
      resourceType: 'supplier_product',
      resourceId: data.id,
      details: { title: input.title, category: input.category },
    });

    return {
      id: data.id,
      businessId: data.business_id,
      title: data.title,
      titleHi: data.title_hi,
      description: data.description,
      category: data.category,
      unit: data.unit,
      unitPrice: Number(data.unit_price),
      hsnCode: data.hsn_code,
      gstRate: Number(data.gst_rate),
      minOrderQuantity: data.min_order_quantity,
      leadTimeDays: data.lead_time_days,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Lists active Requests for Quotation (RFQs).
   */
  static async listRFQs(): Promise<MarketplaceRFQ[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('marketplace_rfqs')
      .select('*, businesses(*), marketplace_quotes(id)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      buyerBusinessId: d.buyer_business_id,
      title: d.title,
      category: d.category,
      description: d.description,
      requiredQuantity: d.required_quantity,
      unit: d.unit,
      targetBudget: d.target_budget ? Number(d.target_budget) : null,
      deliveryPincode: d.delivery_pincode,
      minComplianceScore: d.min_compliance_score,
      status: d.status,
      expiresAt: d.expires_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      quotesCount: d.marketplace_quotes ? d.marketplace_quotes.length : 0,
      buyerBusiness: d.businesses
        ? {
            id: d.businesses.id,
            legalName: d.businesses.legal_name,
            tradeName: d.businesses.trade_name,
            sector: d.businesses.sector,
            jurisdictionCountry: d.businesses.jurisdiction_country,
            jurisdictionState: d.businesses.jurisdiction_state,
            employeeCountBand: d.businesses.employee_count_band,
            turnoverBand: d.businesses.turnover_band,
            investmentBand: d.businesses.investment_band,
            gstin: d.businesses.gstin,
            udyamNumber: d.businesses.udyam_number,
            fssaiNumber: d.businesses.fssai_number,
            pan: d.businesses.pan,
            isVerified: d.businesses.is_verified,
            createdAt: d.businesses.created_at,
            updatedAt: d.businesses.updated_at,
          }
        : undefined,
    }));
  }

  /**
   * Creates a Request for Quotation (RFQ).
   */
  static async createRFQ(
    userId: string,
    buyerBusinessId: string,
    input: CreateMarketplaceRFQInput
  ): Promise<MarketplaceRFQ> {
    const adminSupabase = createAdminClient();
    const expiresAt = new Date(
      Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await adminSupabase
      .from('marketplace_rfqs')
      .insert({
        buyer_business_id: buyerBusinessId,
        title: input.title,
        category: input.category,
        description: input.description,
        required_quantity: input.requiredQuantity,
        unit: input.unit,
        target_budget: input.targetBudget,
        delivery_pincode: input.deliveryPincode,
        min_compliance_score: input.minComplianceScore,
        expires_at: expiresAt,
        status: 'open',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create RFQ: ${error?.message}`);
    }

    await AuditService.record({
      businessId: buyerBusinessId,
      actorId: userId,
      action: 'MARKETPLACE_RFQ_CREATED',
      resourceType: 'marketplace_rfq',
      resourceId: data.id,
      details: { title: input.title, quantity: input.requiredQuantity },
    });

    return {
      id: data.id,
      buyerBusinessId: data.buyer_business_id,
      title: data.title,
      category: data.category,
      description: data.description,
      requiredQuantity: data.required_quantity,
      unit: data.unit,
      targetBudget: data.target_budget ? Number(data.target_budget) : null,
      deliveryPincode: data.delivery_pincode,
      minComplianceScore: data.min_compliance_score,
      status: data.status,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Submits a supplier quote for an RFQ.
   */
  static async submitQuote(
    userId: string,
    supplierBusinessId: string,
    input: SubmitMarketplaceQuoteInput
  ): Promise<MarketplaceQuote> {
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('marketplace_quotes')
      .insert({
        rfq_id: input.rfqId,
        supplier_business_id: supplierBusinessId,
        unit_price: input.unitPrice,
        total_amount: input.totalAmount,
        validity_days: input.validityDays,
        delivery_days: input.deliveryDays,
        notes: input.notes,
        status: 'submitted',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to submit quote: ${error?.message}`);
    }

    // Update RFQ status to quotes_received
    await adminSupabase
      .from('marketplace_rfqs')
      .update({ status: 'quotes_received', updated_at: new Date().toISOString() })
      .eq('id', input.rfqId);

    await AuditService.record({
      businessId: supplierBusinessId,
      actorId: userId,
      action: 'MARKETPLACE_QUOTE_SUBMITTED',
      resourceType: 'marketplace_quote',
      resourceId: data.id,
      details: { rfqId: input.rfqId, totalAmount: input.totalAmount },
    });

    return {
      id: data.id,
      rfqId: data.rfq_id,
      supplierBusinessId: data.supplier_business_id,
      unitPrice: Number(data.unit_price),
      totalAmount: Number(data.total_amount),
      validityDays: data.validity_days,
      deliveryDays: data.delivery_days,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Buyer accepts quote -> Creates Escrow Order.
   */
  static async acceptQuoteAndCreateOrder(
    userId: string,
    quoteId: string
  ): Promise<MarketplaceOrder> {
    const adminSupabase = createAdminClient();

    // Fetch quote and associated RFQ
    const { data: quote, error: quoteError } = await adminSupabase
      .from('marketplace_quotes')
      .select('*, marketplace_rfqs(*)')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    const rfq = quote.marketplace_rfqs;

    // Update quote to accepted
    await adminSupabase
      .from('marketplace_quotes')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', quoteId);

    // Update other quotes to rejected
    await adminSupabase
      .from('marketplace_quotes')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('rfq_id', quote.rfq_id)
      .neq('id', quoteId);

    // Update RFQ to awarded
    await adminSupabase
      .from('marketplace_rfqs')
      .update({ status: 'awarded', updated_at: new Date().toISOString() })
      .eq('id', quote.rfq_id);

    // Create Order with Escrow
    const { data: order, error: orderError } = await adminSupabase
      .from('marketplace_orders')
      .insert({
        rfq_id: quote.rfq_id,
        quote_id: quote.id,
        buyer_business_id: rfq.buyer_business_id,
        supplier_business_id: quote.supplier_business_id,
        amount: quote.total_amount,
        escrow_status: 'held_in_escrow',
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create escrow order: ${orderError?.message}`);
    }

    await AuditService.record({
      businessId: rfq.buyer_business_id,
      actorId: userId,
      action: 'MARKETPLACE_ORDER_ESCROW_CREATED',
      resourceType: 'marketplace_order',
      resourceId: order.id,
      details: { quoteId, amount: Number(quote.total_amount) },
    });

    return {
      id: order.id,
      rfqId: order.rfq_id,
      quoteId: order.quote_id,
      buyerBusinessId: order.buyer_business_id,
      supplierBusinessId: order.supplier_business_id,
      amount: Number(order.amount),
      escrowStatus: order.escrow_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }

  /**
   * Lists orders for a buyer or supplier business.
   */
  static async listOrders(businessId: string): Promise<MarketplaceOrder[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('*, marketplace_quotes(*), marketplace_rfqs(*)')
      .or(`buyer_business_id.eq.${businessId},supplier_business_id.eq.${businessId}`)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      rfqId: d.rfq_id,
      quoteId: d.quote_id,
      buyerBusinessId: d.buyer_business_id,
      supplierBusinessId: d.supplier_business_id,
      amount: Number(d.amount),
      escrowStatus: d.escrow_status,
      paymentTransactionId: d.payment_transaction_id,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }
}
