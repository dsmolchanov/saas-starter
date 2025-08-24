import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { TeacherAdminContent } from '@/components/teacher-admin-content';
import { db } from '@/lib/db/drizzle';
import { courses, classes, users, progress, teachers, playlists } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function TeacherAdminPage() {
  const user = await getUser();
  
  if (!user) {
    console.error('No user found in teacher-admin page, redirecting to sign-in');
    redirect('/sign-in?redirect=/teacher-admin');
  }

  // Get user profile with teacher info
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      teacherProfile: true,
    }
  });

  // Check if user is a teacher - must have either teacher role or a valid teacher profile with ID
  const isTeacher = userProfile?.role === 'teacher' || (userProfile?.teacherProfile && userProfile?.teacherProfile?.id);
  
  if (!isTeacher) {
    console.log('User is not a teacher, redirecting to more page');
    redirect('/more');
  }

  // Ensure teacher profile exists before proceeding
  if (!userProfile?.teacherProfile && userProfile?.role === 'teacher') {
    // Create teacher profile if user has teacher role but no profile
    await db.insert(teachers).values({
      id: user.id,
      bio: null,
    }).onConflictDoNothing();
    
    // Refresh user profile
    const refreshedProfile = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: {
        teacherProfile: true,
      }
    });
    
    if (refreshedProfile) {
      Object.assign(userProfile, refreshedProfile);
    }
  }

  try {
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

    // Get teacher's playlists (exclude system "Liked" playlist)
    const teacherPlaylists = await db.query.playlists.findMany({
      where: and(
        eq(playlists.userId, user.id),
        sql`${playlists.playlistType} != 'liked' OR ${playlists.playlistType} IS NULL`
      ),
      orderBy: [desc(playlists.createdAt)],
    });

    // Calculate statistics
    const totalClasses = standaloneClasses.length + 
      teacherCourses.reduce((acc, course) => acc + course.classes.length, 0);

    // Get view statistics (with safe defaults)
    let viewStats = [{ totalViews: 0, uniqueStudents: 0, totalMinutesWatched: 0 }];
    
    if (totalClasses > 0) {
      const stats = await db
        .select({
          totalViews: sql<number>`COUNT(DISTINCT ${progress.id})`.as('total_views'),
          uniqueStudents: sql<number>`COUNT(DISTINCT ${progress.userId})`.as('unique_students'),
          totalMinutesWatched: sql<number>`COALESCE(SUM(${classes.durationMin}), 0)`.as('total_minutes'),
        })
        .from(progress)
        .innerJoin(classes, eq(progress.classId, classes.id))
        .where(eq(classes.teacherId, user.id));
      
      if (stats.length > 0) {
        viewStats = stats;
      }
    }

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentActivity: any[] = [];
    
    if (totalClasses > 0) {
      recentActivity = await db
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
    }

    // Get popular classes
    let popularClasses: any[] = [];
    
    if (totalClasses > 0) {
      const popClasses = await db
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
      
      popularClasses = popClasses.map(p => ({
        ...p.class,
        viewCount: p.viewCount || 0,
      }));
    }

    return (
      <TeacherAdminContent 
        user={userProfile!}
        courses={teacherCourses}
        standaloneClasses={standaloneClasses}
        playlists={teacherPlaylists}
        stats={{
          totalCourses: teacherCourses.length,
          totalClasses,
          totalViews: viewStats[0]?.totalViews || 0,
          uniqueStudents: viewStats[0]?.uniqueStudents || 0,
          totalMinutesWatched: viewStats[0]?.totalMinutesWatched || 0,
        }}
        recentActivity={recentActivity}
        popularClasses={popularClasses}
      />
    );
  } catch (error) {
    console.error('Error loading teacher admin data:', error);
    
    // Return a minimal version with empty data
    return (
      <TeacherAdminContent 
        user={userProfile!}
        courses={[]}
        standaloneClasses={[]}
        playlists={[]}
        stats={{
          totalCourses: 0,
          totalClasses: 0,
          totalViews: 0,
          uniqueStudents: 0,
          totalMinutesWatched: 0,
        }}
        recentActivity={[]}
        popularClasses={[]}
      />
    );
  }
}