'use server';

import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { setSession } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function verifyOtpAndSignIn(
  email: string,
  token: string,
  redirectTo: string = '/home'
) {
  try {
    // Verify OTP with Supabase
    const supabase = await createServerSupabaseClient();
    // Verify OTP - Supabase uses 'email' type for OTP codes
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    
    console.log('OTP verification result:', { 
      success: !!data?.session, 
      error: error?.message,
      email,
      tokenLength: token.length 
    });

    if (error || !data.session) {
      return { error: error?.message || 'Invalid code' };
    }

    // Get or create user in database
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
          // No password hash for passwordless users
          passwordHash: null,
        })
        .returning();
      
      user = newUser;
    }

    // Set session cookie
    await setSession(user[0]);

    // Redirect to intended page
    redirect(redirectTo);
  } catch (error) {
    console.error('Error in verifyOtpAndSignIn:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return { error: 'Failed to verify code' };
  }
}