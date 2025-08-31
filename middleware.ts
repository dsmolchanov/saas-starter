import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { signToken, verifyToken } from '@/lib/auth/session';
import { locales, defaultLocale } from './i18n';

// Create a separate intl middleware for routes that need i18n
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
  pathnames: {
    // Only include routes that actually have locale support
    // Removed paths that are in route groups without locale structure
  }
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle locale switching via query parameter
  const newLocale = request.nextUrl.searchParams.get('setLocale');
  if (newLocale && ['en', 'es', 'ru'].includes(newLocale)) {
    const response = NextResponse.redirect(request.nextUrl);
    
    // Set the cookie
    response.cookies.set('preferred-language', newLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
    
    // Remove the query parameter
    const url = request.nextUrl.clone();
    url.searchParams.delete('setLocale');
    
    return NextResponse.redirect(url);
  }

  // Skip middleware for problematic routes and (app) route group routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/browse') ||
    pathname.startsWith('/home') ||        // Skip (app) route group routes
    pathname.startsWith('/more') ||        // Skip (app) route group routes
    pathname.startsWith('/admin') ||       // Skip (app) route group routes
    pathname.startsWith('/teacher-studio') || // Skip (app) route group routes
    pathname.startsWith('/lesson/') ||
    pathname.startsWith('/teacher/') ||
    pathname.startsWith('/course/') ||
    pathname.startsWith('/catalog') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/my_practice') || // Skip (app) route group routes
    pathname.startsWith('/teachers') ||    // Skip (app) route group routes  
    pathname.startsWith('/courses') ||     // Skip (app) route group routes
    pathname.startsWith('/classes') ||     // Skip (app) route group routes
    pathname.includes('favicon.ico') ||
    pathname.includes('robots.txt') ||
    pathname.includes('sitemap.xml') ||
    pathname === '/_not-found' ||
    pathname === '/' // Skip root route completely
  ) {
    // Handle session refresh without i18n
    const response = NextResponse.next();
    const sessionCookie = request.cookies.get('session');
    
    // Only refresh session for valid sessions, don't touch expired/invalid ones
    if (sessionCookie && request.method === 'GET') {
      try {
        const parsed = await verifyToken(sessionCookie.value);
        
        // Check if session is still valid (not expired)
        if (parsed && parsed.expires && new Date(parsed.expires) > new Date()) {
          // Only refresh if session expires in less than 3 days
          const daysUntilExpiry = (new Date(parsed.expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          
          if (daysUntilExpiry < 3) {
            const expiresInSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            
            response.cookies.set({
              name: 'session',
              value: await signToken({
                ...parsed,
                expires: expiresInSevenDays.toISOString()
              }),
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              expires: expiresInSevenDays,
              path: '/'
            });
          }
        }
      } catch (error) {
        // Don't log every verification error, it's expected for expired tokens
        // console.error('Session verification failed:', error);
      }
    }
    
    return response;
  }

  // Apply i18n only to routes that actually support locales
  // Currently, only the home page has locale support via [locale] route
  if (
    pathname.match(/^\/[a-z]{2}(-[A-Z]{2})?$/) || // Match locale patterns like /en, /es-MX
    pathname.match(/^\/[a-z]{2}(-[A-Z]{2})?\/.*/) // Match locale-prefixed routes
  ) {
    // Handle i18n for locale routes only
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
        
        // Check if session is still valid (not expired)
        if (parsed && parsed.expires && new Date(parsed.expires) > new Date()) {
          // Only refresh if session expires in less than 3 days
          const daysUntilExpiry = (new Date(parsed.expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          
          if (daysUntilExpiry < 3) {
            const expiresInSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // Clone response to modify cookies
            const res = response || NextResponse.next();
            
            res.cookies.set({
              name: 'session',
              value: await signToken({
                ...parsed,
                expires: expiresInSevenDays.toISOString()
              }),
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              expires: expiresInSevenDays,
              path: '/'
            });
            
            return res;
          }
        }
      } catch (error) {
        // Don't log every verification error, it's expected for expired tokens
        // console.error('Session verification failed:', error);
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
