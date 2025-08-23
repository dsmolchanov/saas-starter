import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { setSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/home';
  
  console.log('Auth callback received:', { token_hash: !!token_hash, type, code: !!code, next });
  
  const supabase = await createServerSupabaseClient();
  
  // Handle OAuth callback (Google)
  if (code) {
    console.log('OAuth callback - exchanging code for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('OAuth exchange error:', error.message);
      return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', requestUrl.origin));
    }
    
    if (data.user) {
      console.log('OAuth successful, user email:', data.user.email);
      
      // Get or create user in database
      const email = data.user.email!;
      let user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        console.log('Creating new user for OAuth:', email);
        // Create new user if doesn't exist
        const newUser = await db
          .insert(users)
          .values({
            email,
            passwordHash: null, // OAuth users don't need password
          })
          .returning();
        
        user = newUser;
      } else {
        console.log('Found existing user for OAuth:', email);
      }

      // Set session cookie
      await setSession(user[0]);
      
      // Successful authentication, redirect to the intended page
      console.log('OAuth: Redirecting to:', next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Handle magic link/OTP
  if (token_hash && type) {
    console.log('Magic link callback - verifying OTP');
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Magic link verification error:', error.message);
      return NextResponse.redirect(new URL('/sign-in?error=invalid_link', requestUrl.origin));
    }

    if (data.user) {
      console.log('Magic link successful, user email:', data.user.email);
      
      // Get or create user in database
      const email = data.user.email!;
      let user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        console.log('Creating new user for magic link:', email);
        // Create new user if doesn't exist
        const newUser = await db
          .insert(users)
          .values({
            email,
            passwordHash: null, // No password for passwordless users
          })
          .returning();
        
        user = newUser;
      } else {
        console.log('Found existing user for magic link:', email);
      }

      // Set session cookie
      await setSession(user[0]);
      
      // Successful authentication, redirect to the intended page
      console.log('Magic link: Redirecting to:', next);
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Authentication failed or no token, redirect to sign-in
  console.log('No valid auth token/code, redirecting to sign-in');
  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}