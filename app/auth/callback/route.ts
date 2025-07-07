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
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        headers: request.headers,
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options });
          }
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

    return NextResponse.redirect(new URL(next, request.url));
  } catch (err) {
    console.error('OAuth callback error', err);
    return NextResponse.redirect(new URL('/', request.url));
  }
} 