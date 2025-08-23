import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { HomeContent } from '@/components/home-content';
import { db } from '@/lib/db/drizzle';
import { classes, courses, teachers, users, progress } from '@/lib/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/home');
  }

  // Get today's date for various features
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  
  // Fetch user's recent progress for streak calculation
  const recentProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, user.id))
    .orderBy(desc(progress.completedAt))
    .limit(30);

  // Calculate current streak
  let currentStreak = 0;
  const sortedProgress = recentProgress.sort((a, b) => 
    b.completedAt.getTime() - a.completedAt.getTime()
  );
  
  let lastDate = new Date();
  for (const p of sortedProgress) {
    const progressDate = new Date(p.completedAt);
    progressDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((lastDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff <= 1) {
      currentStreak++;
      lastDate = progressDate;
    } else {
      break;
    }
  }

  // Get today's recommended class based on user level and time
  const recommendedClass = await db.query.classes.findFirst({
    with: {
      teacher: true,
    },
    where: (classes, { and, lte, gte }) => {
      const hour = new Date().getHours();
      const isEvening = hour >= 17;
      const isMorning = hour < 10;
      
      // Different styles for different times
      if (isMorning) {
        return and(
          sql`${classes.style} IN ('Vinyasa', 'Hatha', 'Power')`,
          lte(classes.durationMin, 30)
        );
      } else if (isEvening) {
        return and(
          sql`${classes.style} IN ('Yin', 'Restorative', 'Hatha')`,
          lte(classes.durationMin, 45)
        );
      }
      return lte(classes.durationMin, 45);
    },
  });

  // Get popular classes (most completed)
  const popularClasses = await db
    .select({
      class: classes,
      teacher: users,
      completionCount: sql<number>`count(${progress.id})`.as('completion_count'),
    })
    .from(classes)
    .leftJoin(progress, eq(progress.classId, classes.id))
    .leftJoin(users, eq(classes.teacherId, users.id))
    .groupBy(classes.id, users.id)
    .orderBy(desc(sql`count(${progress.id})`))
    .limit(5);

  // Get latest classes
  const latestClasses = await db.query.classes.findMany({
    with: {
      teacher: true,
    },
    orderBy: (classes, { desc }) => [desc(classes.id)],
    limit: 5,
  });

  // Get featured teacher (random each day based on date seed)
  const allTeachers = await db.query.teachers.findMany({
    with: {
      user: true,
    },
  });
  
  const todaySeed = today.getDate() + today.getMonth();
  const featuredTeacher = allTeachers[todaySeed % allTeachers.length];

  // Check if user practiced today
  const practicedToday = await db.query.progress.findFirst({
    where: and(
      eq(progress.userId, user.id),
      gte(progress.completedAt, startOfDay)
    ),
  });

  // Get user's total practice minutes
  const totalMinutes = recentProgress.reduce((sum, p) => {
    const lesson = latestClasses.find(c => c.id === p.classId);
    return sum + (lesson?.durationMin || 0);
  }, 0);

  return (
    <HomeContent 
      user={user}
      currentStreak={currentStreak}
      recommendedClass={recommendedClass}
      popularClasses={popularClasses.map(p => ({ ...p.class, teacher: p.teacher }))}
      latestClasses={latestClasses}
      featuredTeacher={featuredTeacher}
      practicedToday={!!practicedToday}
      totalMinutes={totalMinutes}
    />
  );
}