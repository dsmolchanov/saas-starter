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
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await request.json();
  const { bio, instagram_url } = body;

  await db
    .insert(teachers)
    .values({ id: user.id, bio, instagramUrl: instagram_url })
    .onConflictDoUpdate({ target: teachers.id, set: { bio, instagramUrl: instagram_url } });

  return NextResponse.json({ success: true });
} 