import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { AuditService } from '../audit/service';
import crypto from 'crypto';
import type { BusinessMembership, TeamInvite, UserRole } from '@saarthi/shared-types';
import type { CreateTeamInviteInput } from '@saarthi/validation';

export class TeamService {
  /**
   * Creates and records a team member invitation token.
   */
  static async createInvite(
    inviterId: string,
    input: CreateTeamInviteInput
  ): Promise<TeamInvite> {
    const adminSupabase = createAdminClient();
    const token = crypto.randomBytes(24).toString('hex');

    const { data, error } = await adminSupabase
      .from('team_invites')
      .insert({
        business_id: input.businessId,
        invited_by: inviterId,
        email: input.email,
        role_name: input.roleName,
        token,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create team invite: ${error?.message}`);
    }

    await AuditService.record({
      businessId: input.businessId,
      actorId: inviterId,
      action: 'TEAM_MEMBER_INVITED',
      resourceType: 'team_invite',
      resourceId: data.id,
      details: { email: input.email, role: input.roleName },
    });

    return {
      id: data.id,
      businessId: data.business_id,
      invitedBy: data.invited_by,
      email: data.email,
      roleName: data.role_name as UserRole,
      token: data.token,
      expiresAt: data.expires_at,
      acceptedAt: data.accepted_at,
      createdAt: data.created_at,
    };
  }

  /**
   * Accepts a team invite, attaches the user to the business with the invited role, and invalidates the token.
   */
  static async acceptInvite(
    userId: string,
    token: string
  ): Promise<BusinessMembership> {
    const adminSupabase = createAdminClient();

    // 1. Fetch invite
    const { data: invite, error: fetchError } = await adminSupabase
      .from('team_invites')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !invite) {
      throw new Error('Invite token is invalid, already used, or expired.');
    }

    // 2. Create membership
    const { data: membership, error: memberError } = await adminSupabase
      .from('business_memberships')
      .insert({
        user_id: userId,
        business_id: invite.business_id,
        role_name: invite.role_name,
        is_active: true,
      })
      .select()
      .single();

    if (memberError || !membership) {
      throw new Error(`Failed to accept membership: ${memberError?.message}`);
    }

    // 3. Mark invite as accepted
    await adminSupabase
      .from('team_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    // 4. Record Audit Log
    await AuditService.record({
      businessId: invite.business_id,
      actorId: userId,
      action: 'TEAM_INVITE_ACCEPTED',
      resourceType: 'business_membership',
      resourceId: membership.id,
      details: { role: invite.role_name },
    });

    return {
      id: membership.id,
      userId: membership.user_id,
      businessId: membership.business_id,
      roleName: membership.role_name as UserRole,
      isActive: membership.is_active,
      createdAt: membership.created_at,
      updatedAt: membership.updated_at,
    };
  }

  /**
   * Lists active members of a business.
   */
  static async listMembers(businessId: string): Promise<BusinessMembership[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('business_memberships')
      .select('*, profiles(*)')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    return data.map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      businessId: m.business_id,
      roleName: m.role_name as UserRole,
      isActive: m.is_active,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      profile: m.profiles
        ? {
            id: m.profiles.id,
            email: m.profiles.email,
            fullName: m.profiles.full_name,
            phoneNumber: m.profiles.phone_number,
            locale: m.profiles.locale,
            avatarUrl: m.profiles.avatar_url,
            createdAt: m.profiles.created_at,
            updatedAt: m.profiles.updated_at,
          }
        : undefined,
    }));
  }
}
