import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { locales, defaultLocale } from './i18n';

const protectedRoutes = '/dashboard';

// Create the i18n middleware with more specific configuration
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false, // Disable automatic locale detection to avoid header usage
  pathnames: {
    '/': '/',
    '/my_practice': '/my_practice',
    '/browse': '/browse',
    '/teachers': '/teachers',
    '/courses': '/courses',
    '/classes': '/classes'
  }
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, internal Next.js routes, and error pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.startsWith('/_not-found') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }
  
  // Check if this is a protected route before applying i18n
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Apply i18n middleware
  try {
    const intlResponse = intlMiddleware(request);
    let res = intlResponse || NextResponse.next();

    // Handle session refresh for authenticated users
    if (sessionCookie && request.method === 'GET') {
      try {
        const parsed = await verifyToken(sessionCookie.value);
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // If we got an intl response, we need to clone it to modify cookies
        if (intlResponse) {
          res = NextResponse.next();
          // Copy any headers from the intl response
          intlResponse.headers.forEach((value, key) => {
            res.headers.set(key, value);
          });
          // Handle potential redirects from intl middleware
          if (intlResponse.status >= 300 && intlResponse.status < 400) {
            res = NextResponse.redirect(intlResponse.headers.get('location') || request.url);
          }
        }

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
      } catch (error) {
        console.error('Error updating session:', error);
        res.cookies.delete('session');
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL('/sign-in', request.url));
        }
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  // More specific matcher that excludes problematic paths
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     * - _not-found
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|_not-found).*)',
  ],
  runtime: 'nodejs'
};
