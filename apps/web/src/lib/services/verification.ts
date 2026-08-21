import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { getVerificationProvider } from '../providers/verification';
import { AuditService } from '../audit/service';
import type { BusinessVerification, VerificationResult } from '@saarthi/shared-types';

export class VerificationService {
  /**
   * Triggers verification of a business using the configured VerificationProvider.
   * Records audit logs for initiation and outcome.
   */
  static async verifyBusiness(
    businessId: string,
    actorId: string
  ): Promise<{ verification: BusinessVerification; result: VerificationResult }> {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Fetch business details
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (fetchError || !business) {
      throw new Error(`Business not found or access denied: ${fetchError?.message}`);
    }

    // 2. Audit Initiation
    await AuditService.record({
      businessId,
      actorId,
      action: 'BUSINESS_VERIFICATION_INITIATED',
      resourceType: 'business_verification',
      resourceId: businessId,
      details: {
        legalName: business.legal_name,
        gstin: business.gstin,
        udyamNumber: business.udyam_number,
      },
    });

    // 3. Execute Verification via Provider
    const provider = getVerificationProvider();
    const result = await provider.verify({
      businessId,
      legalName: business.legal_name,
      pan: business.pan,
      gstin: business.gstin,
      udyamNumber: business.udyam_number,
      fssaiNumber: business.fssai_number,
      sector: business.sector,
      jurisdictionState: business.jurisdiction_state,
    });

    // 4. Persist Verification Record
    const { data: record, error: insertError } = await adminSupabase
      .from('business_verifications')
      .insert({
        business_id: businessId,
        status: result.status,
        provider_used: result.provider,
        checked_at: result.verifiedAt,
        check_results: result.checks,
        failure_reason: result.failureReason || null,
      })
      .select()
      .single();

    if (insertError || !record) {
      throw new Error(`Failed to store verification record: ${insertError?.message}`);
    }

    // 5. If verified, update businesses.is_verified
    if (result.status === 'verified') {
      await adminSupabase
        .from('businesses')
        .update({ is_verified: true, updated_at: new Date().toISOString() })
        .eq('id', businessId);
    }

    // 6. Audit Outcome
    await AuditService.record({
      businessId,
      actorId,
      action: result.status === 'verified' ? 'BUSINESS_VERIFIED' : 'BUSINESS_VERIFICATION_REJECTED',
      resourceType: 'business_verification',
      resourceId: record.id,
      details: {
        provider: result.provider,
        status: result.status,
        checksCount: result.checks.length,
      },
    });

    const verification: BusinessVerification = {
      id: record.id,
      businessId: record.business_id,
      status: record.status,
      providerUsed: record.provider_used,
      checkedAt: record.checked_at,
      checkResults: record.check_results,
      failureReason: record.failure_reason,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };

    return { verification, result };
  }

  /**
   * Retrieves latest verification report for a business.
   */
  static async getLatestVerification(businessId: string): Promise<BusinessVerification | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('business_verifications')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      businessId: data.business_id,
      status: data.status,
      providerUsed: data.provider_used,
      checkedAt: data.checked_at,
      checkResults: data.check_results,
      failureReason: data.failure_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
