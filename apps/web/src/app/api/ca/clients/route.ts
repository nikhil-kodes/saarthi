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

    const clients = await AdminService.getCADashboardClients(session.user.id);
    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'GET_CA_CLIENTS_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
