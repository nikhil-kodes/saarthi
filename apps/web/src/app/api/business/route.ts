import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { BusinessService } from '@/lib/services/business';
import { createBusinessSchema } from '@saarthi/validation';

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
    const validated = createBusinessSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid business onboarding data',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = await BusinessService.createBusiness(session.user.id, validated.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_BUSINESS_FAILED',
          message: error.message || 'Failed to create business',
        },
      },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (!session.activeMembership) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const business = await BusinessService.getBusinessById(session.activeMembership.businessId);

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_BUSINESS_FAILED',
          message: error.message || 'Failed to fetch business',
        },
      },
      { status: 500 }
    );
  }
}
