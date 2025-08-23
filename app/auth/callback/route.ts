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
  const next = requestUrl.searchParams.get('next') ?? '/home';

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error && data.user) {
      // Get or create user in database
      const email = data.user.email!;
      let user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        // Create new user if doesn't exist
        const newUser = await db
          .insert(users)
          .values({
            email,
            passwordHash: null, // No password for passwordless users
          })
          .returning();
        
        user = newUser;
      }

      // Set session cookie
      await setSession(user[0]);
      
      // Successful authentication, redirect to the intended page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Authentication failed or no token, redirect to sign-in
  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}