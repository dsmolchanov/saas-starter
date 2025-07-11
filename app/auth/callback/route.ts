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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
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

    // Use request origin for development to ensure localhost stays localhost
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectUrl = new URL(next, origin);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('OAuth callback error', err);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectUrl = new URL('/', origin);
    return NextResponse.redirect(redirectUrl);
  }
} 