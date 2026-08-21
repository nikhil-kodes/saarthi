import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { AdminService } from '@/lib/services/admin';

export async function GET() {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const stats = await AdminService.getGlobalStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'GET_ADMIN_STATS_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
