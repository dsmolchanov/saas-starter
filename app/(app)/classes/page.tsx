import { db } from '@/lib/db/drizzle';
import { classes, lessonFocusAreas, focusAreas, courses } from '@/lib/db/schema';
import { eq, and, inArray, sql, isNotNull, or, ilike } from 'drizzle-orm';
import { ClassesContent } from '@/components/classes-content';

// This page needs dynamic rendering for search params and i18n
export const dynamic = 'force-dynamic';

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  
  // Parse filter and search parameters from URL
  const selectedStyles = params?.styles ? (params.styles as string).split(',') : [];
  const selectedLevels = params?.levels ? (params.levels as string).split(',') : [];
  const selectedFocus = params?.focus ? (params.focus as string).split(',') : [];
  const searchQuery = params?.q as string || '';

  // Build where conditions for filtering and searching
  const whereConditions = [];
  
  // Add search condition if search query exists
  if (searchQuery) {
    whereConditions.push(
      or(
        ilike(classes.title, `%${searchQuery}%`),
        ilike(classes.description, `%${searchQuery}%`)
      )
    );
  }
  
  // Add filter conditions
  if (selectedStyles.length > 0) {
    whereConditions.push(inArray(classes.style, selectedStyles));
  }
  if (selectedLevels.length > 0) {
    whereConditions.push(inArray(classes.difficulty, selectedLevels));
  }

  // Fetch filtered classes with teacher info for search
  const classesData = await db.query.classes.findMany({
    with: {
      teacher: true,
      focusAreas: {
        with: {
          focusArea: true,
        },
      },
    },
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    limit: 50,
  });

  // Apply additional filters in memory (focus areas and teacher name search)
  let filteredClasses = classesData;
  
  // Filter by focus areas if selected
  if (selectedFocus.length > 0) {
    filteredClasses = filteredClasses.filter(cls => {
      const classFocusIds = cls.focusAreas.map(fa => fa.focusArea.id);
      return selectedFocus.some(focusId => classFocusIds.includes(focusId));
    });
  }
  
  // Additional fuzzy search on teacher names if search query exists
  if (searchQuery && filteredClasses.length > 0) {
    // If we have results but want to also include teacher name matches
    const searchLower = searchQuery.toLowerCase();
    const teacherMatches = classesData.filter(cls => {
      const teacherName = cls.teacher?.name?.toLowerCase() || '';
      return teacherName.includes(searchLower);
    });
    
    // Combine results (remove duplicates)
    const combinedIds = new Set([...filteredClasses.map(c => c.id), ...teacherMatches.map(c => c.id)]);
    filteredClasses = classesData.filter(cls => combinedIds.has(cls.id));
  }
  
  // Get available filter options with counts
  const [allStyles, allLevels, allFocusAreas] = await Promise.all([
    db.select({ 
      style: classes.style,
      count: sql<number>`count(*)`.as('count')
    })
      .from(classes)
      .where(isNotNull(classes.style))
      .groupBy(classes.style),
      
    db.select({ 
      level: classes.difficulty,
      count: sql<number>`count(*)`.as('count')
    })
      .from(classes)
      .where(isNotNull(classes.difficulty))
      .groupBy(classes.difficulty),
      
    db.select({
      id: focusAreas.id,
      name: focusAreas.name,
    })
      .from(focusAreas)
  ]);

  // Format filter options
  const availableFilters = {
    styles: allStyles.map(s => ({ 
      value: s.style!, 
      label: s.style!,
      count: Number(s.count)
    })),
    levels: allLevels.map(l => ({ 
      value: l.level!, 
      label: l.level!,
      count: Number(l.count)
    })),
    focusAreas: allFocusAreas.map(fa => ({ 
      value: fa.id, 
      label: fa.name 
    })),
  };

  return (
    <ClassesContent 
      filteredClasses={filteredClasses}
      availableFilters={availableFilters}
      searchQuery={searchQuery}
    />
  );
}
