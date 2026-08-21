import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { VerificationService } from '@/lib/services/verification';
import { requirePermission } from '@/lib/rbac/service';
import { initiateVerificationSchema } from '@saarthi/validation';

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
    const validated = initiateVerificationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid business verification request',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // RBAC: Requires business.verify permission
    requirePermission(session.permissions, 'business.verify', 'initiating verification');

    const result = await VerificationService.verifyBusiness(
      validated.data.businessId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: error.message || 'Verification process failed',
        },
      },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const verification = await VerificationService.getLatestVerification(
      session.activeMembership.businessId
    );

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_VERIFICATION_FAILED',
          message: error.message || 'Failed to fetch verification status',
        },
      },
      { status: 500 }
    );
  }
}
