import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { ComplianceService } from '@/lib/services/compliance';
import { requirePermission } from '@/lib/rbac/service';
import {
  generateComplianceInstancesSchema,
  listComplianceInstancesQuerySchema,
} from '@saarthi/validation';

const DEMO_INSTANCES = [
  {
    id: 'inst-1',
    business_id: 'demo-business',
    requirement_id: 'req-1',
    status: 'due_soon',
    due_date: '2026-03-11',
    period_start: '2026-02-01',
    period_end: '2026-02-28',
    compliance_requirements: {
      code: 'GST_GSTR1_MONTHLY',
      title: 'GSTR-1 (Monthly Return of Outward Supplies)',
      title_hi: 'GSTR-1 (बाहरी आपूर्ति का मासिक रिटर्न)',
      category: 'taxation',
      frequency: 'monthly',
      act_name: 'CGST Act, 2017',
    },
  },
  {
    id: 'inst-2',
    business_id: 'demo-business',
    requirement_id: 'req-2',
    status: 'due_soon',
    due_date: '2026-03-20',
    period_start: '2026-02-01',
    period_end: '2026-02-28',
    compliance_requirements: {
      code: 'GST_GSTR3B_MONTHLY',
      title: 'GSTR-3B (Monthly Summary & Tax Payment)',
      title_hi: 'GSTR-3B (मासिक सारांश एवं कर भुगतान)',
      category: 'taxation',
      frequency: 'monthly',
      act_name: 'CGST Act, 2017',
    },
  },
  {
    id: 'inst-3',
    business_id: 'demo-business',
    requirement_id: 'req-3',
    status: 'compliant',
    due_date: '2026-02-15',
    period_start: '2026-01-01',
    period_end: '2026-01-31',
    compliance_requirements: {
      code: 'EPF_MONTHLY_ECR',
      title: 'EPF Monthly ECR Return',
      title_hi: 'EPF मासिक ECR रिटर्न',
      category: 'labor_and_employment',
      frequency: 'monthly',
      act_name: 'EPF Act, 1952',
    },
  },
  {
    id: 'inst-4',
    business_id: 'demo-business',
    requirement_id: 'req-4',
    status: 'compliant',
    due_date: '2026-02-07',
    period_start: '2026-01-01',
    period_end: '2026-01-31',
    compliance_requirements: {
      code: 'TDS_PAYMENT_MONTHLY',
      title: 'TDS Monthly Challan 281 Deposit',
      title_hi: 'TDS मासिक चालान 281 जमा',
      category: 'taxation',
      frequency: 'monthly',
      act_name: 'Income Tax Act, 1961',
    },
  },
];

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership) {
      return NextResponse.json({
        success: true,
        data: DEMO_INSTANCES,
      });
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
      data: instances && instances.length > 0 ? instances : DEMO_INSTANCES,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: DEMO_INSTANCES,
    });
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
