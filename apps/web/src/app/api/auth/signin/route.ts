import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { signInSchema } from '@saarthi/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = signInSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid sign-in credentials',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const data = await AuthService.signIn(validated.data);

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
          code: 'SIGNIN_FAILED',
          message: error.message || 'Authentication failed',
        },
      },
      { status: 401 }
    );
  }
}
