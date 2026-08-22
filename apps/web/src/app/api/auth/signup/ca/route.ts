import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, icaiMembership, practiceName, specialization, locale = 'en' } = body;

    const authData = await AuthService.signUp({ email, password, fullName, locale });
    const userId = authData.user?.id;

    if (!userId) {
      throw new Error('Failed to create user');
    }

    const adminClient = await createAdminClient();

    // Update user metadata to save ICAI membership
    await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...authData.user?.user_metadata,
        icai_membership: icaiMembership,
        specialization: specialization,
      }
    });

    // Create a business for the CA practice
    const { data: business, error: businessError } = await adminClient
      .from('businesses')
      .insert({
        legal_name: practiceName,
        sector: 'Services',
        jurisdiction_country: 'IN',
        jurisdiction_state: 'DL', // Default
      })
      .select('id')
      .single();

    if (businessError) throw businessError;

    // Create a business membership with role 'ca_partner'
    const { error: membershipError } = await adminClient
      .from('business_memberships')
      .insert({
        user_id: userId,
        business_id: business.id,
        role_name: 'ca_partner',
        is_active: true,
      });

    if (membershipError) throw membershipError;

    return NextResponse.json({
      success: true,
      data: {
        userId,
        email,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message || 'Failed to create user account',
        },
      },
      { status: 400 }
    );
  }
}
