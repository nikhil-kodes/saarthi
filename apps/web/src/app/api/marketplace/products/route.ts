import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { MarketplaceService } from '@/lib/services/marketplace';
import { createSupplierProductSchema } from '@saarthi/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const products = await MarketplaceService.listProducts(category);
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'LIST_PRODUCTS_FAILED', message: error.message } },
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

    const businessId = session.activeMembership?.businessId;
    if (!businessId) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_ACTIVE_BUSINESS', message: 'No active business membership' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = createSupplierProductSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid product input',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const product = await MarketplaceService.createProduct(
      session.user.id,
      businessId,
      validated.data
    );

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_PRODUCT_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
