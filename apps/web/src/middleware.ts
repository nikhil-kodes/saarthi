import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

// Routes requiring authentication
const PROTECTED_ROUTE_PATTERNS = [
  /^\/(en|hi)\/dashboard(\/.*)?$/,
  /^\/(en|hi)\/compliance(\/.*)?$/,
  /^\/(en|hi)\/notices(\/.*)?$/,
  /^\/(en|hi)\/schemes(\/.*)?$/,
  /^\/(en|hi)\/payments(\/.*)?$/,
  /^\/(en|hi)\/marketplace(\/.*)?$/,
  /^\/(en|hi)\/score(\/.*)?$/,
  /^\/(en|hi)\/team(\/.*)?$/,
  /^\/(en|hi)\/settings(\/.*)?$/,
  /^\/(en|hi)\/admin(\/.*)?$/,
];

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase auth session
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Handle internationalized routing
  const response = handleI18nRouting(request);

  // Copy Supabase auth cookies onto the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  // 3. Check for protected routes
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));

  if (isProtected && !user) {
    // Determine target locale from path (default 'en')
    const localeMatch = pathname.match(/^\/(en|hi)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/', '/(hi|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
