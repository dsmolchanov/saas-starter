import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function localeMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if locale has changed via query parameter
  const newLocale = request.nextUrl.searchParams.get('setLocale');
  
  if (newLocale && ['en', 'es', 'ru'].includes(newLocale)) {
    // Set the cookie
    response.cookies.set('preferred-language', newLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
    
    // Remove the query parameter and redirect
    const url = request.nextUrl.clone();
    url.searchParams.delete('setLocale');
    
    return NextResponse.redirect(url);
  }
  
  return response;
}