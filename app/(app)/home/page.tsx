import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { HomeContent } from '@/components/home-content';
import { db } from '@/lib/db/drizzle';
import { classes, courses, teachers, users, progress } from '@/lib/db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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

  // Get user's preferred language from cookies
  const cookieStore = await cookies();
  const locale = cookieStore.get('preferred-language')?.value || 'en';
  
  // Fetch spiritual content from Supabase
  const supabase = await createServerSupabaseClient();
  
  // Get localized classes
  const { data: localizedClasses } = await supabase
    .rpc('get_classes_localized', {
      p_locale: locale,
      p_limit: 50
    });

  // Filter for recommended class based on time
  const hour = new Date().getHours();
  const isEvening = hour >= 17;
  const isMorning = hour < 10;
  
  const recommendedClass = localizedClasses?.find((cls: any) => {
    if (isMorning) {
      return ['Vinyasa', 'Hatha', 'Power'].includes(cls.style) && cls.duration_min <= 30;
    } else if (isEvening) {
      return ['Yin', 'Restorative', 'Hatha'].includes(cls.style) && cls.duration_min <= 45;
    }
    return cls.duration_min <= 45;
  });

  // Get popular class IDs from progress
  const popularClassIds = await db
    .select({
      classId: progress.classId,
      completionCount: sql<number>`count(${progress.id})`.as('completion_count'),
    })
    .from(progress)
    .groupBy(progress.classId)
    .orderBy(desc(sql`count(${progress.id})`))
    .limit(5);

  // Map to localized classes
  const popularClasses = popularClassIds
    .map(p => localizedClasses?.find((c: any) => c.id === p.classId))
    .filter(Boolean)
    .slice(0, 5);

  // Get latest 5 localized classes (already sorted by the RPC)
  const latestClasses = localizedClasses?.slice(0, 5) || [];

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
    const lesson = localizedClasses?.find((c: any) => c.id === p.classId);
    return sum + (lesson?.duration_min || 0);
  }, 0);
  
  // Fetch all spiritual content in one RPC call with proper localization
  const { data: spiritualData } = await supabase
    .rpc('get_spiritual_content_localized', {
      p_locale: locale,
      p_date: new Date().toISOString().split('T')[0]
    });
  
  // Extract the localized content
  const todayChakra = spiritualData?.chakra;
  const moonPhase = spiritualData?.moonPhase;
  const yogaQuote = spiritualData?.yogaQuote;

  // Transform localized classes to match expected format
  const transformClass = (cls: any) => ({
    id: cls.id,
    title: cls.title,
    description: cls.description,
    durationMin: cls.duration_min,
    videoUrl: cls.video_url,
    thumbnailUrl: cls.thumbnail_url,
    coverUrl: cls.cover_url,
    difficulty: cls.difficulty,
    intensity: cls.intensity,
    style: cls.style,
    equipment: cls.equipment,
    teacher: {
      id: cls.teacher_id,
      name: cls.teacher_name,
    }
  });

  return (
    <HomeContent 
      user={user}
      currentStreak={currentStreak}
      recommendedClass={recommendedClass ? transformClass(recommendedClass) : undefined}
      popularClasses={popularClasses.map(transformClass)}
      latestClasses={latestClasses.map(transformClass)}
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