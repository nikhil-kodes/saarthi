import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { TeamService } from '@/lib/services/team';
import { requirePermission } from '@/lib/rbac/service';
import { createTeamInviteSchema } from '@saarthi/validation';

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
    const validated = createTeamInviteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid team invite payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // RBAC: Requires team.invite permission
    requirePermission(session.permissions, 'team.invite', 'inviting team members');

    const invite = await TeamService.createInvite(session.user.id, validated.data);

    return NextResponse.json({
      success: true,
      data: invite,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVITE_FAILED',
          message: error.message || 'Failed to send team invite',
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

    const members = await TeamService.listMembers(session.activeMembership.businessId);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LIST_TEAM_FAILED',
          message: error.message || 'Failed to list team members',
        },
      },
      { status: 500 }
    );
  }
}
