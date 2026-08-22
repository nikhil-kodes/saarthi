import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, businessName, gstin, productCategory, locale = 'en' } = body;

    const authData = await AuthService.signUp({ email, password, fullName, locale });
    const userId = authData.user?.id;

    if (!userId) {
      throw new Error('Failed to create user');
    }

    const adminClient = await createAdminClient();

    // Create a business for the supplier
    const { data: business, error: businessError } = await adminClient
      .from('businesses')
      .insert({
        legal_name: businessName,
        sector: productCategory,
        gstin: gstin,
        jurisdiction_country: 'IN',
        jurisdiction_state: 'DL', // Default
      })
      .select('id')
      .single();

    if (businessError) throw businessError;

    // Create a business membership with role 'supplier'
    const { error: membershipError } = await adminClient
      .from('business_memberships')
      .insert({
        user_id: userId,
        business_id: business.id,
        role_name: 'supplier',
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
