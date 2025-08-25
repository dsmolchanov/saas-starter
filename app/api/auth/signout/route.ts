import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

// Remove GET handler - signout should only be POST to prevent accidental logouts
// export async function GET(request: NextRequest) {
//   return NextResponse.json(
//     { error: 'Method not allowed. Use POST to sign out.' }, 
//     { status: 405 }
//   );
// } 