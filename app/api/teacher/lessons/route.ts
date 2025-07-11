import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { classes, lessonFocusAreas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await req.json();
  const { title, description, durationMin, video_url, focus_area_ids = [] } = body;

  // Create class linked to teacher (teacherId = user.id)
  const [lesson] = await db
    .insert(classes)
    .values({
      courseId: null, // TODO course support later
      teacherId: user.id,
      title,
      description,
      durationMin,
      videoPath: video_url
    })
    .returning();

  if (focus_area_ids.length > 0) {
    await db.insert(lessonFocusAreas).values(
      focus_area_ids.map((fid: string) => ({ classId: lesson.id, focusAreaId: fid }))
    );
  }

  return NextResponse.json({ success: true, lessonId: lesson.id });
} 