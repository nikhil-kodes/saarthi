import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { AdminService } from '@/lib/services/admin';
import { exportComplianceDossierSchema } from '@saarthi/validation';

export async function POST(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = exportComplianceDossierSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid export payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const dossier = await AdminService.exportComplianceDossier(validated.data.businessId);
    return NextResponse.json({
      success: true,
      data: dossier,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'EXPORT_DOSSIER_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
