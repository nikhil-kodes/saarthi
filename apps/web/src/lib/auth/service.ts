import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { getPermissionsForRole } from '../rbac/service';
import { AuditService } from '../audit/service';
import type {
  AuthSession,
  BusinessMembership,
  Profile,
  UserRole,
} from '@saarthi/shared-types';
import type { SignInInput, SignUpInput } from '@saarthi/validation';

export class AuthService {
  /**
   * Registers a new user with Supabase Auth and creates their profile.
   */
  static async signUp(input: SignUpInput) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          locale: input.locale || 'en',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      await AuditService.record({
        actorId: data.user.id,
        action: 'AUTH_SIGNUP',
        resourceType: 'user',
        resourceId: data.user.id,
        details: { email: input.email, locale: input.locale },
      });
    }

    return data;
  }

  /**
   * Authenticates user with email and password.
   */
  static async signIn(input: SignInInput) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      await AuditService.record({
        actorId: data.user.id,
        action: 'AUTH_SIGNIN',
        resourceType: 'user',
        resourceId: data.user.id,
        details: { email: input.email },
      });
    }

    return data;
  }

  /**
   * Signs out the currently authenticated user.
   */
  static async signOut() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await AuditService.record({
        actorId: user.id,
        action: 'AUTH_SIGNOUT',
        resourceType: 'user',
        resourceId: user.id,
      });
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Retrieves the current user's profile and active business memberships.
   */
  static async getSession(): Promise<AuthSession | null> {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profile: Profile | null = profileData
        ? {
            id: profileData.id,
            email: profileData.email,
            fullName: profileData.full_name,
            phoneNumber: profileData.phone_number,
            locale: profileData.locale,
            avatarUrl: profileData.avatar_url,
            createdAt: profileData.created_at,
            updatedAt: profileData.updated_at,
          }
        : null;

      // Fetch business memberships
      const { data: membershipsData } = await supabase
        .from('business_memberships')
        .select('*, businesses(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const memberships: BusinessMembership[] = (membershipsData || []).map(
        (m: any) => ({
          id: m.id,
          userId: m.user_id,
          businessId: m.business_id,
          roleName: m.role_name as UserRole,
          isActive: m.is_active,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          business: m.businesses
            ? {
                id: m.businesses.id,
                legalName: m.businesses.legal_name,
                tradeName: m.businesses.trade_name,
                sector: m.businesses.sector,
                jurisdictionCountry: m.businesses.jurisdiction_country,
                jurisdictionState: m.businesses.jurisdiction_state,
                employeeCountBand: m.businesses.employee_count_band,
                turnoverBand: m.businesses.turnover_band,
                investmentBand: m.businesses.investment_band,
                gstin: m.businesses.gstin,
                udyamNumber: m.businesses.udyam_number,
                fssaiNumber: m.businesses.fssai_number,
                pan: m.businesses.pan,
                isVerified: m.businesses.is_verified,
                createdAt: m.businesses.created_at,
                updatedAt: m.businesses.updated_at,
              }
            : undefined,
        })
      );

      const activeMembership = memberships[0] || null;
      const permissions = activeMembership
        ? getPermissionsForRole(activeMembership.roleName)
        : [];

      return {
        user: {
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name,
          locale: user.user_metadata?.locale || 'en',
        },
        profile,
        activeMembership,
        memberships,
        permissions,
      };
    } catch (err) {
      console.error('[AuthService] Error fetching session:', err);
      return null;
    }
  }

  /**
   * Sends password reset email.
   */
  static async resetPasswordForEmail(email: string, redirectTo?: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL || ''}/auth/callback`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
