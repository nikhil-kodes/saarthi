import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import type { AuditLog, Business } from '@saarthi/shared-types';

export interface GlobalAdminStats {
  totalBusinesses: number;
  verifiedBusinesses: number;
  totalFilings: number;
  openNotices: number;
  totalMarketplaceOrders: number;
  activeCampaigns: number;
}

export interface CAClientOverview {
  business: Business;
  complianceCount: number;
  overdueCount: number;
  dueSoonCount: number;
  healthScore?: number;
  latestNoticeCount: number;
}

export class AdminService {
  /**
   * Fetches global platform aggregates for administrative overview.
   */
  static async getGlobalStats(): Promise<GlobalAdminStats> {
    const adminSupabase = createAdminClient();

    const [
      { count: totalBusinesses },
      { count: verifiedBusinesses },
      { count: totalFilings },
      { count: openNotices },
      { count: totalMarketplaceOrders },
      { count: activeCampaigns },
    ] = await Promise.all([
      adminSupabase.from('businesses').select('*', { count: 'exact', head: true }),
      adminSupabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      adminSupabase.from('compliance_filing_records').select('*', { count: 'exact', head: true }),
      adminSupabase.from('compliance_notices').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
      adminSupabase.from('marketplace_orders').select('*', { count: 'exact', head: true }),
      adminSupabase.from('creator_campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    return {
      totalBusinesses: totalBusinesses || 0,
      verifiedBusinesses: verifiedBusinesses || 0,
      totalFilings: totalFilings || 0,
      openNotices: openNotices || 0,
      totalMarketplaceOrders: totalMarketplaceOrders || 0,
      activeCampaigns: activeCampaigns || 0,
    };
  }

  /**
   * Lists system audit logs with optional filtering.
   */
  static async listAuditLogs(
    businessId?: string,
    action?: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    if (action) {
      query = query.ilike('action', `%${action}%`);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      businessId: d.business_id,
      actorId: d.actor_id,
      action: d.action,
      resourceType: d.resource_type,
      resourceId: d.resource_id,
      details: d.details || {},
      ipAddress: d.ip_address,
      userAgent: d.user_agent,
      createdAt: d.created_at,
    }));
  }

  /**
   * Lists client businesses assigned to a Chartered Accountant (CA) partner.
   */
  static async getCADashboardClients(userId: string): Promise<CAClientOverview[]> {
    const adminSupabase = createAdminClient();

    // 1. Get businesses where user has ca_partner or owner membership
    const { data: memberships, error } = await adminSupabase
      .from('business_memberships')
      .select('business_id, businesses(*)')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !memberships) {
      return [];
    }

    const clients: CAClientOverview[] = [];

    for (const m of memberships as any[]) {
      const b = Array.isArray(m.businesses) ? m.businesses[0] : m.businesses;
      if (!b || !b.id) continue;

      const [instancesRes, noticesRes, scoreRes] = await Promise.all([
        adminSupabase
          .from('business_compliance_instances')
          .select('status')
          .eq('business_id', b.id),
        adminSupabase
          .from('compliance_notices')
          .select('id')
          .eq('business_id', b.id)
          .neq('status', 'resolved'),
        adminSupabase
          .from('compliance_health_scores')
          .select('score')
          .eq('business_id', b.id)
          .order('computed_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const instances = instancesRes.data || [];
      const overdueCount = instances.filter((i: any) => i.status === 'overdue').length;
      const dueSoonCount = instances.filter((i: any) => i.status === 'due_soon').length;

      clients.push({
        business: {
          id: b.id,
          legalName: b.legal_name,
          tradeName: b.trade_name,
          sector: b.sector,
          jurisdictionCountry: b.jurisdiction_country,
          jurisdictionState: b.jurisdiction_state,
          employeeCountBand: b.employee_count_band,
          turnoverBand: b.turnover_band,
          investmentBand: b.investment_band,
          gstin: b.gstin,
          udyamNumber: b.udyam_number,
          fssaiNumber: b.fssai_number,
          pan: b.pan,
          isVerified: b.is_verified,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        },
        complianceCount: instances.length,
        overdueCount,
        dueSoonCount,
        healthScore: scoreRes.data?.score,
        latestNoticeCount: (noticesRes.data || []).length,
      });
    }

    return clients;
  }

  /**
   * Compiles an official statutory compliance dossier for export / bank credit / CA review.
   */
  static async exportComplianceDossier(businessId: string) {
    const adminSupabase = createAdminClient();

    const [
      businessRes,
      instancesRes,
      filingsRes,
      noticesRes,
      scoreRes,
    ] = await Promise.all([
      adminSupabase.from('businesses').select('*').eq('id', businessId).single(),
      adminSupabase
        .from('business_compliance_instances')
        .select('*, compliance_requirements(*)')
        .eq('business_id', businessId),
      adminSupabase
        .from('compliance_filing_records')
        .select('*')
        .eq('business_id', businessId)
        .order('filed_at', { ascending: false }),
      adminSupabase
        .from('compliance_notices')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false }),
      adminSupabase
        .from('compliance_health_scores')
        .select('*')
        .eq('business_id', businessId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const generatedAt = new Date().toISOString();

    return {
      protocol: 'Saarthi MSME Compliance Protocol v1.0',
      exportId: `dossier_${businessId.slice(0, 8)}_${Date.now()}`,
      generatedAt,
      business: businessRes.data,
      healthScore: scoreRes.data,
      complianceSummary: {
        totalInstances: (instancesRes.data || []).length,
        compliantInstances: (instancesRes.data || []).filter((i) => i.status === 'compliant').length,
        overdueInstances: (instancesRes.data || []).filter((i) => i.status === 'overdue').length,
      },
      filingRecords: filingsRes.data || [],
      noticesAudit: noticesRes.data || [],
    };
  }
}
