import { db } from '@/lib/db/drizzle';
import { classes, lessonFocusAreas, focusAreas, courses } from '@/lib/db/schema';
import { eq, and, inArray, sql, isNotNull, or, ilike } from 'drizzle-orm';
import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { BrowseFilters } from '@/components/browse-filters';
import { BrowseSearch } from '@/components/browse-search';

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">BROWSE</h1>
        <p className="text-muted-foreground mt-1">
          Find the perfect workout or wellness class to match your mood.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <BrowseSearch />
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button variant="ghost" className="px-4 py-2 bg-background shadow-sm" size="sm">
              Classes
            </Button>
            <Button variant="ghost" className="px-4 py-2" size="sm" asChild>
              <Link href="/courses">Courses</Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <BrowseFilters availableFilters={availableFilters} type="classes" />
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-0">
          {filteredClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">No classes found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'Check back later for new classes or try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClasses.map((lesson) => (
                <ClassCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  instructor={lesson.teacher?.name || 'Instructor'}
                  duration={lesson.durationMin || 0}
                  difficulty={lesson.difficulty || 'All Levels'}
                  intensity={lesson.intensity?.toLowerCase() || 'moderate'}
                  focusAreas={lesson.focusAreas.map(fa => fa.focusArea.name)}
                  thumbnailUrl={lesson.thumbnailUrl || undefined}
                  likes={Math.floor(Math.random() * 1000)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
