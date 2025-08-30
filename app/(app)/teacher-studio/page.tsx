// Server component for teacher studio dashboard
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems } from '@/lib/db/schema-content';
import { eq, and, desc, sql } from 'drizzle-orm';
import { TeacherStudioDashboard } from '@/components/teacher-studio/dashboard';

export default async function TeacherStudioPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user is a teacher
  if (user.role !== 'teacher' && user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  // Get teacher's content statistics
  const stats = await db
    .select({
      totalContent: sql<number>`count(*)`,
      publishedContent: sql<number>`count(*) filter (where status = 'published')`,
      draftContent: sql<number>`count(*) filter (where status = 'draft')`,
      totalViews: sql<number>`sum(COALESCE((metadata->>'views')::int, 0))`,
    })
    .from(contentItems)
    .where(eq(contentItems.teacherId, user.id));
  
  // Get content grouped by type for Netflix-style display
  const contentByType = await Promise.all([
    // Courses
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'course')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Classes
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'class')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Meditations
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'meditation')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Quick Flows
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'quick_flow')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Breathing Exercises
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'breathing')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Challenges
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'challenge')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Workshops
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'workshop')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Programs
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'program')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
    // Asanas
    db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.teacherId, user.id),
          eq(contentItems.contentType, 'asana')
        )
      )
      .orderBy(desc(contentItems.updatedAt))
      .limit(10),
  ]);

  const [courses, classes, meditations, quickFlows, breathing, challenges, workshops, programs, asanas] = contentByType;
  
  return (
    <TeacherStudioDashboard
      user={user}
      stats={stats[0]}
      contentByType={{
        courses,
        classes,
        meditations,
        quickFlows,
        breathing,
        challenges,
        workshops,
        programs,
        asanas
      }}
    />
  );
}