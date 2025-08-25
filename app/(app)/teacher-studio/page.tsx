// Server component for teacher studio dashboard
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems } from '@/lib/db/schema-content';
import { eq, desc, sql } from 'drizzle-orm';
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
  
  // Get recent content
  const recentContent = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.teacherId, user.id))
    .orderBy(desc(contentItems.updatedAt))
    .limit(5);
  
  // Get content type distribution
  const contentTypes = await db
    .select({
      contentType: contentItems.contentType,
      count: sql<number>`count(*)`,
    })
    .from(contentItems)
    .where(eq(contentItems.teacherId, user.id))
    .groupBy(contentItems.contentType);
  
  return (
    <TeacherStudioDashboard
      user={user}
      stats={stats[0]}
      recentContent={recentContent}
      contentTypes={contentTypes}
    />
  );
}