import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { displayName, email, password, platform, primaryLanguage, niche, handle, followerCount, locale = 'en' } = body;

    const authData = await AuthService.signUp({ email, password, fullName: displayName, locale });
    const userId = authData.user?.id;

    if (!userId) {
      throw new Error('Failed to create user');
    }

    const adminClient = await createAdminClient();

    // Create a business for the creator
    const { data: business, error: businessError } = await adminClient
      .from('businesses')
      .insert({
        legal_name: displayName,
        sector: 'Creator',
        jurisdiction_country: 'IN',
        jurisdiction_state: 'DL', // Default
      })
      .select('id')
      .single();

    if (businessError) throw businessError;

    // Create a business membership with role 'influencer'
    const { error: membershipError } = await adminClient
      .from('business_memberships')
      .insert({
        user_id: userId,
        business_id: business.id,
        role_name: 'influencer',
        is_active: true,
      });

    if (membershipError) throw membershipError;

    // Create creator profile
    const { error: creatorError } = await adminClient
      .from('creator_profiles')
      .insert({
        user_id: userId,
        business_id: business.id,
        display_name: displayName,
        handle: handle,
        platform: platform,
        primary_language: primaryLanguage,
        niche: niche,
        follower_count: parseInt(followerCount) || 0,
        rate_card: {},
        is_verified: false,
      });

    if (creatorError) throw creatorError;

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
