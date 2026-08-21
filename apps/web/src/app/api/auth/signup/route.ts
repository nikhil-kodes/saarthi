import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { signUpSchema } from '@saarthi/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = signUpSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration input',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const data = await AuthService.signUp(validated.data);

    return NextResponse.json({
      success: true,
      data: {
        userId: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SIGNUP_FAILED',
          message: error.message || 'Failed to create user account',
        },
      },
      { status: 400 }
    );
  }
}
