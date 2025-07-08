import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log(`[Auth Callback] Request URL: ${request.url}`);
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/';
    console.log(`[Auth Callback] 'next' param: ${next}`);

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
        }
      }
    );

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }

    const {
      data: { user: supaUser }
    } = await supabase.auth.getUser();

    if (supaUser?.email) {
      const [internal] = await db
        .select()
        .from(users)
        .where(eq(users.email, supaUser.email))
        .limit(1);
      if (internal) {
        await setSession(internal);
      }
    }

    // Temporarily redirect to home with debug params
    const debugUrl = new URL('/', process.env.NEXT_PUBLIC_SITE_URL!);
    debugUrl.searchParams.set('debug_next', next);
    const finalRedirectUrl = new URL(next, process.env.NEXT_PUBLIC_SITE_URL!);
    debugUrl.searchParams.set('final_url', finalRedirectUrl.href);

    return NextResponse.redirect(debugUrl);
  } catch (err) {
    console.error('OAuth callback error', err);
    // On error, also redirect with debug info
    const errorUrl = new URL('/', process.env.NEXT_PUBLIC_SITE_URL || request.url);
    errorUrl.searchParams.set('error', 'oauth_callback_failed');
    if (err instanceof Error) {
      errorUrl.searchParams.set('error_message', err.message);
    }
    return NextResponse.redirect(errorUrl);
  }
} 