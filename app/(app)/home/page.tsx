import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { HomeContent } from '@/components/home-content';
import { db } from '@/lib/db/drizzle';
import { classes, courses, teachers, users, progress } from '@/lib/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

  // Fetch spiritual content from Supabase
  const supabase = await createServerSupabaseClient();
  
  // Ensure spiritual content is available (this will auto-populate if needed)
  await supabase.rpc('ensure_spiritual_content_available');
  
  // Get today's chakra
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: chakraFocus } = await supabase
    .from('chakra_daily_focus')
    .select(`
      *,
      chakra:chakras(*)
    `)
    .eq('date', todayStr)
    .single();

  // If no focus for today, get default based on day of week
  let todayChakra = chakraFocus?.chakra;
  if (!todayChakra) {
    const dayOfWeek = new Date().getDay();
    const chakraNumber = (dayOfWeek % 7) + 1;
    const { data: defaultChakra } = await supabase
      .from('chakras')
      .select('*')
      .eq('number', chakraNumber)
      .single();
    todayChakra = defaultChakra;
  }

  // Get today's moon phase
  const { data: moonCalendar } = await supabase
    .from('moon_calendar')
    .select(`
      *,
      phase:moon_phases(*)
    `)
    .eq('date', todayStr)
    .single();

  let moonPhase = moonCalendar?.phase;
  if (!moonPhase) {
    // Calculate moon phase if no calendar entry
    const lunarCycle = 29.53059;
    const knownNewMoon = new Date('2024-01-11T00:00:00Z');
    const daysSinceNewMoon = (today.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const currentCycle = (daysSinceNewMoon % lunarCycle + lunarCycle) % lunarCycle;
    const phaseValue = currentCycle / lunarCycle;
    
    // Get all moon phases and find closest
    const { data: allPhases } = await supabase
      .from('moon_phases')
      .select('*')
      .order('phase_value');
    
    if (allPhases && allPhases.length > 0) {
      moonPhase = allPhases.reduce((closest, phase) => {
        const closestDiff = Math.abs(phaseValue - closest.phase_value);
        const phaseDiff = Math.abs(phaseValue - phase.phase_value);
        return phaseDiff < closestDiff ? phase : closest;
      }, allPhases[0]);
    }
  }

  // Get today's quote
  const { data: dailyQuote } = await supabase
    .from('daily_quotes')
    .select(`
      *,
      quote:yoga_quotes(
        *,
        text:yoga_texts(*)
      )
    `)
    .eq('date', todayStr)
    .single();

  let yogaQuote = dailyQuote?.quote;
  if (!yogaQuote) {
    // Get a random quote if none for today
    const { data: allQuotes } = await supabase
      .from('yoga_quotes')
      .select(`
        *,
        text:yoga_texts(*)
      `);
    
    if (allQuotes && allQuotes.length > 0) {
      yogaQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    }
  }

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
      spiritualContent={{
        chakra: todayChakra,
        moonPhase: moonPhase,
        yogaQuote: yogaQuote
      }}
    />
  );
}