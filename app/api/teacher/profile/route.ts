import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teachers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const [profile] = await db.select().from(teachers).where(eq(teachers.id, user.id)).limit(1);
  return NextResponse.json({ profile: profile ?? null });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const body = await request.json();
    const { bio, instagram_url } = body;

    // Validate input
    const trimmedBio = bio?.trim() || null;
    const trimmedInstagram = instagram_url?.trim() || null;

    // Validate Instagram username format if provided
    if (trimmedInstagram) {
      // Remove @ if present and validate
      const cleanUsername = trimmedInstagram.replace('@', '');
      if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
        return NextResponse.json({ 
          error: 'Instagram username can only contain letters, numbers, dots, and underscores' 
        }, { status: 400 });
      }
      if (cleanUsername.length < 1 || cleanUsername.length > 30) {
        return NextResponse.json({ 
          error: 'Instagram username must be between 1 and 30 characters' 
        }, { status: 400 });
      }
    }

    await db
      .insert(teachers)
      .values({ id: user.id, bio: trimmedBio, instagramUrl: trimmedInstagram })
      .onConflictDoUpdate({ 
        target: teachers.id, 
        set: { bio: trimmedBio, instagramUrl: trimmedInstagram } 
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 