import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get('next') ?? '/';
    if (!next.startsWith('/')) {
      // if "next" is not a relative URL, use the default
      next = '/';
    }

    console.log('Auth callback received:', { code: code?.substring(0, 10) + '...', next });

    if (code) {
      // Map Next.js cookies helper to the interface expected by Supabase helper
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options });
            },
          }
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Supabase auth exchange error:', error);
        // Redirect to login with error
        return NextResponse.redirect(`${origin}/login?error=auth_failed&next=${encodeURIComponent(next)}`);
      }
      
      // Get user data after successful session exchange
      const {
        data: { user: supaUser }
      } = await supabase.auth.getUser();

      if (supaUser?.email) {
        let [internal] = await db
          .select()
          .from(users)
          .where(eq(users.email, supaUser.email))
          .limit(1);
        
        // If user doesn't exist in our database, create them
        if (!internal) {
          console.log('Creating user in database:', supaUser.email);
          const [newUser] = await db
            .insert(users)
            .values({
              id: supaUser.id, // Use the Supabase auth user ID
              name: supaUser.user_metadata?.full_name || supaUser.email,
              email: supaUser.email,
              avatarUrl: supaUser.user_metadata?.avatar_url,
              role: 'student'
            })
            .returning();
          internal = newUser;
        }
        
        if (internal) {
          console.log('Setting session for user:', internal.email);
          await setSession(internal);
        }
      }

      // Handle redirects according to Supabase recommendations
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // return the user to an error page with instructions
    console.error('OAuth callback error: No code provided');
    return NextResponse.redirect(`${origin}/login?error=no_code&next=${encodeURIComponent(next)}`);
  } catch (err) {
    console.error('OAuth callback unexpected error:', err);
    const { origin } = new URL(request.url);
    const next = new URL(request.url).searchParams.get('next') ?? '/';
    return NextResponse.redirect(`${origin}/login?error=callback_error&next=${encodeURIComponent(next)}`);
  }
} 