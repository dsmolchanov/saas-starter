import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { locales, defaultLocale } from './i18n';

const protectedRoutes = '/dashboard';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only add locale prefix for non-default locales
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);
  
  // Check if this is a protected route
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Start with the i18n response or create a new one
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
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
  runtime: 'nodejs'
};
