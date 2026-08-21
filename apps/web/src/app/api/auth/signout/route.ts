import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';

export async function POST() {
  try {
    await AuthService.signOut();
    return NextResponse.json({
      success: true,
      data: { message: 'Successfully signed out' },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SIGNOUT_FAILED',
          message: error.message || 'Failed to sign out',
        },
      },
      { status: 500 }
    );
  }
}
