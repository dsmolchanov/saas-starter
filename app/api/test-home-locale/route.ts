import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { progress } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('preferred-language')?.value || 'en';
  
  const supabase = await createServerSupabaseClient();
  
  // Get localized classes
  const { data: localizedClasses, error } = await supabase
    .rpc('get_classes_localized', {
      p_locale: locale,
      p_limit: 50
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
  let popularClasses: any[] = [];
  if (popularClassIds.length > 0) {
    popularClasses = popularClassIds
      .map(p => {
        const found = localizedClasses?.find((c: any) => c.id === p.classId);
        return found ? {
          id: found.id,
          title: found.title,
          classId: p.classId,
          completions: p.completionCount
        } : null;
      })
      .filter(Boolean);
  } else {
    popularClasses = localizedClasses?.slice(0, 5).map((c: any) => ({
      id: c.id,
      title: c.title
    })) || [];
  }
  
  const latestClasses = localizedClasses?.slice(0, 5).map((c: any) => ({
    id: c.id,
    title: c.title
  })) || [];
  
  return NextResponse.json({
    locale,
    popularClassIds: popularClassIds.map(p => ({
      id: p.classId,
      count: p.completionCount
    })),
    popularClasses,
    latestClasses,
    totalLocalizedClasses: localizedClasses?.length || 0,
    error
  });
}