import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { progress, classes, courses, playlists, playlistItems } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { MyLibraryContent } from '@/components/my-library-content';

export const dynamic = 'force-dynamic';

export default async function MyPracticePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get user's practice history
  const practiceHistory = await db
    .select({
      progress: progress,
      class: classes,
      course: courses,
    })
    .from(progress)
    .innerJoin(classes, eq(progress.classId, classes.id))
    .leftJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(progress.userId, user.id))
    .orderBy(desc(progress.completedAt))
    .limit(20);

  // Get user's playlists
  const userPlaylists = await db.query.playlists.findMany({
    where: eq(playlists.userId, user.id),
    with: {
      items: {
        orderBy: (items, { asc }) => [asc(items.orderIndex)],
      },
    },
    orderBy: [desc(playlists.updatedAt)],
  });

  // Get saved/favorited items (using playlists with specific types)
  const savedPlaylist = await db.query.playlists.findFirst({
    where: and(
      eq(playlists.userId, user.id),
      eq(playlists.playlistType, 'favorites')
    ),
    with: {
      items: {
        orderBy: (items, { desc }) => [desc(items.addedAt)],
      },
    },
  });

  // Get user's enrolled courses
  const enrolledCourses = await db
    .select({
      course: courses,
      progress: sql<number>`COUNT(DISTINCT ${progress.classId})`.as('completed_classes'),
      totalClasses: sql<number>`COUNT(DISTINCT ${classes.id})`.as('total_classes'),
    })
    .from(courses)
    .innerJoin(classes, eq(classes.courseId, courses.id))
    .leftJoin(
      progress,
      and(
        eq(progress.classId, classes.id),
        eq(progress.userId, user.id)
      )
    )
    .groupBy(courses.id)
    .having(sql`COUNT(DISTINCT ${progress.classId}) > 0`);

  // Calculate stats
  const totalPracticeTime = await db
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(${classes.durationMin}), 0)`.as('total_minutes'),
    })
    .from(progress)
    .innerJoin(classes, eq(progress.classId, classes.id))
    .where(eq(progress.userId, user.id));

  const totalSessions = practiceHistory.length;
  const uniqueTeachers = new Set(practiceHistory.map(p => p.class.teacherId)).size;

  // Get recently added classes (for recommendations)
  const recentClasses = await db.query.classes.findMany({
    orderBy: [desc(classes.createdAt)],
    limit: 10,
  });

  return (
    <MyLibraryContent
      user={user}
      history={practiceHistory.map(h => ({
        progressId: h.progress.id,
        completedAt: h.progress.completedAt,
        class: {
          id: h.class.id,
          title: h.class.title,
          durationMin: h.class.durationMin,
          thumbnailUrl: h.class.thumbnailUrl,
          teacherId: h.class.teacherId,
          style: h.class.style,
        },
        course: h.course ? {
          id: h.course.id,
          title: h.course.title,
        } : undefined,
      }))}
      playlists={userPlaylists}
      savedItems={savedPlaylist?.items || []}
      enrolledCourses={enrolledCourses}
      stats={{
        totalMinutes: totalPracticeTime[0]?.totalMinutes || 0,
        totalSessions,
        uniqueTeachers,
      }}
      recentClasses={recentClasses}
    />
  );
}