import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import type {
  GovernmentScheme,
  SchemeApplication,
  Business,
} from '@saarthi/shared-types';
import type { ApplySchemeInput } from '@saarthi/validation';

export class SchemesService {
  /**
   * Evaluates eligibility of a business against scheme criteria.
   */
  static evaluateEligibility(
    business: Partial<Business>,
    scheme: GovernmentScheme
  ): { isEligible: boolean; reason: string } {
    const rules = scheme.eligibilityCriteria || {};

    // 1. State jurisdiction check
    if (scheme.jurisdictionState && business.jurisdictionState) {
      if (scheme.jurisdictionState !== business.jurisdictionState) {
        return {
          isEligible: false,
          reason: `Requires operations in ${scheme.jurisdictionState} (current state: ${business.jurisdictionState})`,
        };
      }
    }

    // 2. Enterprise type check (micro / small / medium)
    if (rules.enterprise_types && Array.isArray(rules.enterprise_types)) {
      const type = (business.turnoverBand || 'micro').toLowerCase();
      if (!rules.enterprise_types.includes(type)) {
        return {
          isEligible: false,
          reason: `Requires enterprise turnover category to be one of: ${rules.enterprise_types.join(', ')}`,
        };
      }
    }

    // 3. Mandatory Udyam certificate
    if (rules.requires_udyam && !business.udyamNumber) {
      return {
        isEligible: false,
        reason: 'Requires an active Udyam MSME Registration Number',
      };
    }

    // 4. Mandatory GSTIN
    if (rules.requires_gstin && !business.gstin) {
      return {
        isEligible: false,
        reason: 'Requires active GSTIN registration',
      };
    }

    return {
      isEligible: true,
      reason: '100% criteria met (State, Enterprise Category & Registrations verified)',
    };
  }

  /**
   * Lists all schemes with dynamic business-specific eligibility evaluation.
   */
  static async listSchemesForBusiness(businessId: string): Promise<GovernmentScheme[]> {
    const supabase = await createClient();

    // Fetch business profile
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    // Fetch all active schemes
    const { data: schemes, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('is_active', true)
      .order('max_benefit_amount', { ascending: false });

    if (error || !schemes) {
      return [];
    }

    return schemes.map((s: any) => {
      const schemeObj: GovernmentScheme = {
        id: s.id,
        code: s.code,
        title: s.title,
        titleHi: s.title_hi,
        ministry: s.ministry,
        description: s.description,
        descriptionHi: s.description_hi,
        eligibilityCriteria: s.eligibility_criteria,
        maxBenefitAmount: Number(s.max_benefit_amount),
        benefitType: s.benefit_type,
        applicationUrl: s.application_url,
        jurisdictionState: s.jurisdiction_state,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };

      if (business) {
        const evaluation = this.evaluateEligibility(business, schemeObj);
        schemeObj.isEligible = evaluation.isEligible;
        schemeObj.eligibilityReason = evaluation.reason;
      }

      return schemeObj;
    });
  }

  /**
   * Submits a scheme application and records audit trail.
   */
  static async applyForScheme(
    userId: string,
    input: ApplySchemeInput
  ): Promise<SchemeApplication> {
    const adminSupabase = createAdminClient();
    const trackingNumber = `SAR-SCH-${Date.now().toString().slice(-6)}`;

    const { data, error } = await adminSupabase
      .from('scheme_applications')
      .insert({
        business_id: input.businessId,
        scheme_id: input.schemeId,
        applicant_user_id: userId,
        status: 'submitted',
        application_data: input.applicationData,
        tracking_number: trackingNumber,
      })
      .select('*, government_schemes(*)')
      .single();

    if (error || !data) {
      throw new Error(`Failed to apply for scheme: ${error?.message}`);
    }

    await AuditService.record({
      businessId: input.businessId,
      actorId: userId,
      action: 'SCHEME_APPLICATION_SUBMITTED',
      resourceType: 'scheme_application',
      resourceId: data.id,
      details: {
        schemeId: input.schemeId,
        trackingNumber,
      },
    });

    return {
      id: data.id,
      businessId: data.business_id,
      schemeId: data.scheme_id,
      applicantUserId: data.applicant_user_id,
      status: data.status,
      applicationData: data.application_data,
      trackingNumber: data.tracking_number,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      scheme: data.government_schemes
        ? {
            id: data.government_schemes.id,
            code: data.government_schemes.code,
            title: data.government_schemes.title,
            titleHi: data.government_schemes.title_hi,
            ministry: data.government_schemes.ministry,
            description: data.government_schemes.description,
            descriptionHi: data.government_schemes.description_hi,
            eligibilityCriteria: data.government_schemes.eligibility_criteria,
            maxBenefitAmount: Number(data.government_schemes.max_benefit_amount),
            benefitType: data.government_schemes.benefit_type,
            applicationUrl: data.government_schemes.application_url,
            jurisdictionState: data.government_schemes.jurisdiction_state,
            isActive: data.government_schemes.is_active,
            createdAt: data.government_schemes.created_at,
            updatedAt: data.government_schemes.updated_at,
          }
        : undefined,
    };
  }
}
