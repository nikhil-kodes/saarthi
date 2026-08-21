import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { QUEUE_NAMES } from '@saarthi/shared-types';

export async function GET() {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const queueStatuses = QUEUE_NAMES.map((queueName) => ({
      name: queueName,
      status: 'operational',
      counts: {
        waiting: 0,
        active: 0,
        completed: 18,
        failed: 0,
        delayed: 0,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        queues: queueStatuses,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'QUEUE_STATUS_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
