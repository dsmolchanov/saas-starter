import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { MoreContent } from '@/components/more-content';
import { db } from '@/lib/db/drizzle';
import { progress, practiceStreaks, users, classes } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function MorePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in?redirect=/more');
  }

  // Get user's complete profile with teacher info if applicable
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      teacherProfile: true,
    }
  });

  // Calculate total practice stats
  const allProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, user.id));

  // Get practice streak
  const streak = await db.query.practiceStreaks.findFirst({
    where: eq(practiceStreaks.userId, user.id),
  });

  // Calculate statistics
  const totalSessions = allProgress.length;
  const uniqueDays = new Set(
    allProgress.map(p => p.completedAt.toDateString())
  ).size;

  // Calculate total minutes (we'll need to join with classes to get duration)
  const totalMinutesResult = await db
    .select({
      totalMinutes: sql<number>`COALESCE(SUM(classes.duration_min), 0)`.as('total_minutes')
    })
    .from(progress)
    .innerJoin(classes, eq(progress.classId, classes.id))
    .where(eq(progress.userId, user.id));

  const totalMinutes = totalMinutesResult[0]?.totalMinutes || 0;

  // Calculate member since date (using user creation date or first progress)
  const memberSince = allProgress.length > 0 
    ? new Date(Math.min(...allProgress.map(p => p.completedAt.getTime())))
    : new Date();

  return (
    <MoreContent 
      user={userProfile || user}
      stats={{
        practiceMinutes: Math.floor(totalMinutes * 0.8), // Estimate actual practice time
        totalMinutes,
        sessions: totalSessions,
        activeDays: uniqueDays,
        memberSince,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      }}
    />
  );
}