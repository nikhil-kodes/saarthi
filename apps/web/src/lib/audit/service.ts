import { createAdminClient } from '../supabase/admin';
import type { AuditLog } from '@saarthi/shared-types';

export interface RecordAuditParams {
  businessId?: string | null;
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  /**
   * Synchronously records an immutable audit log entry in PostgreSQL.
   */
  static async record(params: RecordAuditParams): Promise<AuditLog | null> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          business_id: params.businessId || null,
          actor_id: params.actorId || null,
          action: params.action,
          resource_type: params.resourceType,
          resource_id: params.resourceId || null,
          details: params.details || {},
          ip_address: params.ipAddress || null,
          user_agent: params.userAgent || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[AuditService] Failed to record audit log:', error);
        return null;
      }

      return {
        id: data.id,
        businessId: data.business_id,
        actorId: data.actor_id,
        action: data.action,
        resourceType: data.resource_type,
        resourceId: data.resource_id,
        details: data.details,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('[AuditService] Unexpected error recording audit:', err);
      return null;
    }
  }
}
