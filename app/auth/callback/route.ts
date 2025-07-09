import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/';

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

    const redirectUrl = new URL(next, process.env.NEXT_PUBLIC_SITE_URL!);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('OAuth callback error', err);
    const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_SITE_URL || request.url);
    return NextResponse.redirect(redirectUrl);
  }
} 