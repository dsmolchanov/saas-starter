import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Delete session cookie
    cookieStore.delete('session');
    
    // Delete any other auth-related cookies
    cookieStore.delete('supabase-auth-token');
    cookieStore.delete('sb-refresh-token');
    
    console.log('Session cookies cleared');
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
} 