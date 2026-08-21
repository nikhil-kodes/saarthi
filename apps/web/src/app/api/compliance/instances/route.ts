import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { ComplianceService } from '@/lib/services/compliance';
import { requirePermission } from '@/lib/rbac/service';
import {
  generateComplianceInstancesSchema,
  listComplianceInstancesQuerySchema,
} from '@saarthi/validation';

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    requirePermission(session.permissions, 'compliance.view', 'viewing compliance instances');

    const url = new URL(request.url);
    const queryParams = {
      status: url.searchParams.get('status') || undefined,
      category: url.searchParams.get('category') || undefined,
      fromDate: url.searchParams.get('fromDate') || undefined,
      toDate: url.searchParams.get('toDate') || undefined,
    };

    const validated = listComplianceInstancesQuerySchema.safeParse(queryParams);

    const instances = await ComplianceService.listBusinessInstances(
      session.activeMembership.businessId,
      validated.success ? validated.data : undefined
    );

    return NextResponse.json({
      success: true,
      data: instances,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_COMPLIANCE_FAILED',
          message: error.message || 'Failed to fetch compliance calendar',
        },
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    requirePermission(session.permissions, 'compliance.manage', 'generating compliance instances');

    const body = await request.json().catch(() => ({}));
    const validated = generateComplianceInstancesSchema.safeParse({
      businessId: session.activeMembership.businessId,
      year: body.year || new Date().getFullYear(),
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid instance generation payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const count = await ComplianceService.generateInstancesForBusiness(
      validated.data.businessId,
      validated.data.year
    );

    return NextResponse.json({
      success: true,
      data: { generatedCount: count },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GENERATE_INSTANCES_FAILED',
          message: error.message || 'Failed to generate compliance instances',
        },
      },
      { status: 400 }
    );
  }
}
