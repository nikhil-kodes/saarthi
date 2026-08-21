import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { ComplianceService } from '@/lib/services/compliance';
import { requirePermission } from '@/lib/rbac/service';
import { createFilingRecordSchema } from '@saarthi/validation';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    requirePermission(session.permissions, 'compliance.manage', 'recording compliance filing');

    const body = await request.json();
    const validated = createFilingRecordSchema.safeParse({
      ...body,
      instanceId: params.id,
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid filing submission data',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const filing = await ComplianceService.recordFiling(
      session.user.id,
      params.id,
      validated.data
    );

    return NextResponse.json({
      success: true,
      data: filing,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RECORD_FILING_FAILED',
          message: error.message || 'Failed to record compliance filing',
        },
      },
      { status: 400 }
    );
  }
}
