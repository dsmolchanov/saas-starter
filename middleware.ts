import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { signToken, verifyToken } from '@/lib/auth/session';
import { locales, defaultLocale } from './i18n';

// Create the intl middleware with more restrictive configuration
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false, // Disable automatic locale detection to avoid header usage
  pathnames: {
    '/': '/',
    '/my_practice': '/my_practice',
    '/teachers': '/teachers',
    '/courses': '/courses',
    '/classes': '/classes'
  }
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for problematic routes - be more aggressive
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/browse') ||
    pathname.startsWith('/lesson/') ||
    pathname.startsWith('/teacher/') ||
    pathname.startsWith('/course/') ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/login') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('robots.txt') ||
    pathname.includes('sitemap.xml') ||
    pathname === '/_not-found'
  ) {
    return NextResponse.next();
  }

  // Only apply i18n to a very limited set of routes
  if (
    pathname === '/' || 
    pathname.startsWith('/my_practice') ||
    pathname.startsWith('/teachers') ||
    pathname.startsWith('/courses') ||
    pathname.startsWith('/classes')
  ) {
    // Handle i18n for specific routes only
    let response;
    try {
      response = intlMiddleware(request);
    } catch (error) {
      console.error('Intl middleware error:', error);
      response = NextResponse.next();
    }

    // Handle session refresh for authenticated users
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie && request.method === 'GET') {
      try {
        const parsed = await verifyToken(sessionCookie.value);
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Clone response to modify cookies
        const res = response || NextResponse.next();
        
        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString()
          }),
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expires: expiresInOneDay
        });
        
        return res;
      } catch (error) {
        console.error('Error updating session:', error);
        // Don't delete session cookie, just continue
      }
    }

    return response || NextResponse.next();
  }

  // For all other routes, just pass through without i18n
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|_not-found).*)',
  ],
  runtime: 'nodejs'
};
