import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('compliance_requirements')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FETCH_FAILED', message: error?.message || 'Failed to load requirements' },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
