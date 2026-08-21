import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import type { Business, BusinessMembership } from '@saarthi/shared-types';
import type { CreateBusinessInput } from '@saarthi/validation';

export class BusinessService {
  /**
   * Creates a new business entity and automatically establishes the creator as 'owner'.
   */
  static async createBusiness(
    userId: string,
    input: CreateBusinessInput
  ): Promise<{ business: Business; membership: BusinessMembership }> {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Insert Business
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .insert({
        legal_name: input.legalName,
        trade_name: input.tradeName || null,
        sector: input.sector,
        jurisdiction_country: input.jurisdictionCountry || 'IN',
        jurisdiction_state: input.jurisdictionState || 'UP',
        employee_count_band: input.employeeCountBand || null,
        turnover_band: input.turnoverBand || null,
        investment_band: input.investmentBand || null,
        gstin: input.gstin || null,
        udyam_number: input.udyamNumber || null,
        fssai_number: input.fssaiNumber || null,
        pan: input.pan || null,
        is_verified: false,
      })
      .select()
      .single();

    if (businessError || !businessData) {
      throw new Error(`Failed to create business: ${businessError?.message}`);
    }

    // 2. Attach creator as Owner membership
    const { data: membershipData, error: membershipError } = await adminSupabase
      .from('business_memberships')
      .insert({
        user_id: userId,
        business_id: businessData.id,
        role_name: 'owner',
        is_active: true,
      })
      .select()
      .single();

    if (membershipError || !membershipData) {
      throw new Error(`Failed to establish ownership membership: ${membershipError?.message}`);
    }

    // 3. Record Audit Event
    await AuditService.record({
      businessId: businessData.id,
      actorId: userId,
      action: 'BUSINESS_CREATED',
      resourceType: 'business',
      resourceId: businessData.id,
      details: {
        legalName: input.legalName,
        sector: input.sector,
        state: input.jurisdictionState,
      },
    });

    const business: Business = {
      id: businessData.id,
      legalName: businessData.legal_name,
      tradeName: businessData.trade_name,
      sector: businessData.sector,
      jurisdictionCountry: businessData.jurisdiction_country,
      jurisdictionState: businessData.jurisdiction_state,
      employeeCountBand: businessData.employee_count_band,
      turnoverBand: businessData.turnover_band,
      investmentBand: businessData.investment_band,
      gstin: businessData.gstin,
      udyamNumber: businessData.udyam_number,
      fssaiNumber: businessData.fssai_number,
      pan: businessData.pan,
      isVerified: businessData.is_verified,
      createdAt: businessData.created_at,
      updatedAt: businessData.updated_at,
    };

    const membership: BusinessMembership = {
      id: membershipData.id,
      userId: membershipData.user_id,
      businessId: membershipData.business_id,
      roleName: membershipData.role_name,
      isActive: membershipData.is_active,
      createdAt: membershipData.created_at,
      updatedAt: membershipData.updated_at,
    };

    return { business, membership };
  }

  /**
   * Retrieves business details by ID if the user is an authorized member.
   */
  static async getBusinessById(businessId: string): Promise<Business | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      legalName: data.legal_name,
      tradeName: data.trade_name,
      sector: data.sector,
      jurisdictionCountry: data.jurisdiction_country,
      jurisdictionState: data.jurisdiction_state,
      employeeCountBand: data.employee_count_band,
      turnoverBand: data.turnover_band,
      investmentBand: data.investment_band,
      gstin: data.gstin,
      udyamNumber: data.udyam_number,
      fssaiNumber: data.fssai_number,
      pan: data.pan,
      isVerified: data.is_verified,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
