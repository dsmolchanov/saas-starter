import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { TeacherAdminContent } from '@/components/teacher-admin-content';
import { db } from '@/lib/db/drizzle';
import { courses, classes, users, progress } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function TeacherAdminPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/teacher-admin');
  }

  // Check if user is a teacher
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      teacherProfile: true,
    }
  });

  if (!userProfile?.teacherProfile && userProfile?.role !== 'teacher') {
    redirect('/more');
  }

  // Get teacher's courses
  const teacherCourses = await db.query.courses.findMany({
    where: eq(courses.teacherId, user.id),
    with: {
      classes: true,
    },
    orderBy: [desc(courses.id)],
  });

  // Get teacher's standalone classes (not part of any course)
  const standaloneClasses = await db.query.classes.findMany({
    where: and(
      eq(classes.teacherId, user.id),
      sql`${classes.courseId} IS NULL`
    ),
    orderBy: [desc(classes.createdAt)],
  });

  // Calculate statistics
  const totalClasses = standaloneClasses.length + 
    teacherCourses.reduce((acc, course) => acc + course.classes.length, 0);

  // Get view statistics
  const viewStats = await db
    .select({
      totalViews: sql<number>`COUNT(DISTINCT ${progress.id})`.as('total_views'),
      uniqueStudents: sql<number>`COUNT(DISTINCT ${progress.userId})`.as('unique_students'),
      totalMinutesWatched: sql<number>`COALESCE(SUM(${classes.durationMin}), 0)`.as('total_minutes'),
    })
    .from(progress)
    .innerJoin(classes, eq(progress.classId, classes.id))
    .where(eq(classes.teacherId, user.id));

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity = await db
    .select({
      date: sql<string>`DATE(${progress.completedAt})`.as('date'),
      views: sql<number>`COUNT(*)`.as('views'),
    })
    .from(progress)
    .innerJoin(classes, eq(progress.classId, classes.id))
    .where(and(
      eq(classes.teacherId, user.id),
      sql`${progress.completedAt} >= ${thirtyDaysAgo}`
    ))
    .groupBy(sql`DATE(${progress.completedAt})`)
    .orderBy(desc(sql`DATE(${progress.completedAt})`));

  // Get popular classes
  const popularClasses = await db
    .select({
      class: classes,
      viewCount: sql<number>`COUNT(${progress.id})`.as('view_count'),
    })
    .from(classes)
    .leftJoin(progress, eq(progress.classId, classes.id))
    .where(eq(classes.teacherId, user.id))
    .groupBy(classes.id)
    .orderBy(desc(sql`COUNT(${progress.id})`))
    .limit(5);

  return (
    <TeacherAdminContent 
      user={userProfile}
      courses={teacherCourses}
      standaloneClasses={standaloneClasses}
      stats={{
        totalCourses: teacherCourses.length,
        totalClasses,
        totalViews: viewStats[0]?.totalViews || 0,
        uniqueStudents: viewStats[0]?.uniqueStudents || 0,
        totalMinutesWatched: viewStats[0]?.totalMinutesWatched || 0,
      }}
      recentActivity={recentActivity}
      popularClasses={popularClasses.map(p => ({
        ...p.class,
        viewCount: p.viewCount || 0,
      }))}
    />
  );
}