import { db } from '@/lib/db/drizzle';
import { courses, teachers, classes, categories } from '@/lib/db/schema';
import { CoursesContent } from '@/components/courses-content';
import { and, inArray, isNotNull, sql, or, ilike } from 'drizzle-orm';

// Disable static prerender to avoid DB access at build time
export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  
  // Parse filter and search parameters from URL
  const selectedLevels = params?.levels ? (params.levels as string).split(',') : [];
  const selectedCategories = params?.categories ? (params.categories as string).split(',') : [];
  const searchQuery = params?.q as string || '';
  
  // Build where conditions for filtering and searching
  const whereConditions = [];
  
  // Add search condition if search query exists
  if (searchQuery) {
    whereConditions.push(
      or(
        ilike(courses.title, `%${searchQuery}%`),
        ilike(courses.description, `%${searchQuery}%`)
      )
    );
  }
  
  // Add filter conditions
  if (selectedLevels.length > 0) {
    whereConditions.push(inArray(courses.level, selectedLevels));
  }
  if (selectedCategories.length > 0) {
    whereConditions.push(inArray(courses.categoryId, selectedCategories));
  }
  
  // Fetch filtered courses with teacher info
  const allCourses = await db.query.courses.findMany({
    with: {
      classes: {
        columns: { id: true },
      },
      category: true,
      teacher: true,
    },
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
  });


  // Get available filter options with counts
  const [allLevels, allCategories] = await Promise.all([
    db.select({ 
      level: courses.level,
      count: sql<number>`count(*)`.as('count')
    })
      .from(courses)
      .where(isNotNull(courses.level))
      .groupBy(courses.level),
      
    db.select({
      id: categories.id,
      title: categories.title,
      count: sql<number>`count(*)`.as('count')
    })
      .from(categories)
      .innerJoin(courses, sql`${courses.categoryId} = ${categories.id}`)
      .groupBy(categories.id, categories.title)
  ]);

  // Format filter options
  const availableFilters = {
    levels: allLevels.map(l => ({ 
      value: l.level!, 
      label: l.level!,
      count: Number(l.count)
    })),
    categories: allCategories.map(c => ({ 
      value: c.id, 
      label: c.title,
      count: Number(c.count)
    })),
  };

  return (
    <CoursesContent 
      allCourses={allCourses}
      availableFilters={availableFilters}
      searchQuery={searchQuery}
    />
  );
}
