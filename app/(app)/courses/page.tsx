import { db } from '@/lib/db/drizzle';
import { courses, teachers, classes, categories } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Clock, Play, List, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BrowseFilters } from '@/components/browse-filters';
import { BrowseSearch } from '@/components/browse-search';
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
      teacher: {
        with: {
          user: true,
        },
      },
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">BROWSE</h1>
        <p className="text-muted-foreground mt-1">
          Find the perfect workout or wellness class to match your mood.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <BrowseSearch placeholder="Search courses, categories, or instructors..." />
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button variant="ghost" className="px-4 py-2" size="sm" asChild>
              <Link href="/classes">Classes</Link>
            </Button>
            <Button variant="ghost" className="px-4 py-2 bg-background shadow-sm" size="sm">
              Courses
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <BrowseFilters availableFilters={availableFilters} type="courses" />
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {allCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-medium">No courses found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery 
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'Try adjusting your filters or check back later for new courses.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allCourses.map((course) => (
          <div key={course.id} className="group">
            <Link href={`/course/${course.id}`}>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3 relative">
                {course.coverUrl || course.imageUrl ? (
                  <Image
                    src={course.coverUrl || course.imageUrl || ''}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-2xl font-medium text-primary">
                      {course.title[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Button size="sm" className="gap-2">
                    <Play className="h-4 w-4" />
                    View Course
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {course.classes?.length || 0} {course.classes?.length === 1 ? 'class' : 'classes'}
                </div>
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  By {course.teacher?.user?.name || course.teacher?.name || 'Instructor'}
                </p>
                {course.classes && course.classes.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.classes.length} {course.classes.length === 1 ? 'class' : 'classes'}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
          </div>
        )}
      </div>
    </div>
  );
}
