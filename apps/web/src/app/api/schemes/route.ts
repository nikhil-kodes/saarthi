import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { SchemesService } from '@/lib/services/schemes';
import { applySchemeSchema } from '@saarthi/validation';

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const businessId = session.activeMembership?.businessId;
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ACTIVE_BUSINESS', message: 'No active business membership' } },
        { status: 400 }
      );
    }

    const schemes = await SchemesService.listSchemesForBusiness(businessId);
    return NextResponse.json({
      success: true,
      data: schemes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_SCHEMES_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}

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
    const validated = applySchemeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid scheme application payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const application = await SchemesService.applyForScheme(session.user.id, validated.data);
    return NextResponse.json(
      {
        success: true,
        data: application,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'APPLY_SCHEME_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
