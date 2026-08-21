import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { AdminService } from '@/lib/services/admin';

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || session.activeMembership?.businessId || undefined;
    const action = searchParams.get('action') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const logs = await AdminService.listAuditLogs(businessId, action, limit);
    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_AUDIT_LOGS_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
