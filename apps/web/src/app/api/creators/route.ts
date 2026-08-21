import { NextResponse } from 'next/server';
import { CreatorsService } from '@/lib/services/creators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || undefined;
    const niche = searchParams.get('niche') || undefined;

    const creators = await CreatorsService.listCreators(language, niche);
    return NextResponse.json({
      success: true,
      data: creators,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_CREATORS_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
