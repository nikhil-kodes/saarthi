import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { TeamService } from '@/lib/services/team';
import { acceptTeamInviteSchema } from '@saarthi/validation';

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
    const validated = acceptTeamInviteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid invite acceptance request',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const membership = await TeamService.acceptInvite(session.user.id, validated.data.token);

    return NextResponse.json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ACCEPT_INVITE_FAILED',
          message: error.message || 'Failed to accept team invite',
        },
      },
      { status: 400 }
    );
  }
}
