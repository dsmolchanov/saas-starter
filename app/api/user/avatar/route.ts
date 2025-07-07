import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  await db.update(users).set({ avatarUrl: url, updatedAt: new Date() }).where(eq(users.id, user.id));
  return NextResponse.json({ success: true });
} 