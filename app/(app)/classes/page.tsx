import { db } from '@/lib/db/drizzle';
import { lessons, lessonFocusAreas, focusAreas, courses } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { ClassCard } from '@/components/class-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Filter, X, List, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function ClassesPage({ searchParams }: any) {
  const type = searchParams?.type || 'classes';
  const selectedStyles = searchParams?.styles || [];
  const selectedLevels = searchParams?.levels || [];
  const selectedFocus = searchParams?.focus || [];

  // Fetch classes or courses based on the selected tab
  const [classes, allCourses] = await Promise.all([
    // Fetch classes
    type === 'classes' ? db.query.lessons.findMany({
      with: {
        course: {
          with: {
            teacher: true,
          },
        },
        focusAreas: {
          with: {
            focusArea: true,
          },
        },
      },
      where: (lessons, { and, inArray }) => {
        const conditions = [];
        
        if (selectedStyles.length > 0) {
          conditions.push(inArray(lessons.style, selectedStyles));
        }
        
        if (selectedLevels.length > 0) {
          conditions.push(inArray(lessons.difficulty, selectedLevels));
        }
        
        if (selectedFocus.length > 0) {
          // This would need a subquery in a real implementation
          // Simplified for this example
          conditions.push(sql`1=1`);
        }
        
        return and(...conditions);
      },
      limit: 12,
    }) : [],
    
    // Fetch all courses for the courses tab
    type === 'courses' ? db.query.courses.findMany({
      with: {
        teacher: true,
        lessons: {
          limit: 1,
          orderBy: (lessons, { asc }) => [asc(lessons.orderIndex)],
        },
      },
      limit: 12,
    }) : []
  ]);
  
  // Get all available filters
  const [styles, levels, focusAreasList] = await Promise.all([
    db.selectDistinct({ style: lessons.style })
      .from(lessons)
      .where(sql`${lessons.style} IS NOT NULL`),
      
    db.selectDistinct({ level: lessons.difficulty })
      .from(lessons)
      .where(sql`${lessons.difficulty} IS NOT NULL`),
      
    db.select()
      .from(focusAreas)
  ]);

  const hasFilters = selectedStyles.length > 0 || selectedLevels.length > 0 || selectedFocus.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">BROWSE</h1>
        <p className="text-muted-foreground mt-1">
          Find the perfect workout or wellness class to match your mood.
        </p>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              FILTERS
              {hasFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {selectedStyles.length + selectedLevels.length + selectedFocus.length}
                </span>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {selectedStyles.map((style: string) => (
              <Badge key={style} className="gap-1">
                {style}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedLevels.map((level: string) => (
              <Badge key={level} className="gap-1">
                {level}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedFocus.map((focus: string) => (
              <Badge key={focus} className="gap-1">
                {focus}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              Clear all
            </Button>
          </div>
        )}

        <TabsContent value="classes" className="mt-0">
          {classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">No classes found</h3>
              <p className="text-muted-foreground mt-2">
                Check back later for new classes or try a different filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {classes.map((lesson) => (
                <ClassCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  instructor={lesson.course?.teacher?.name || 'Instructor'}
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
        </TabsContent>

        <TabsContent value="courses" className="mt-0">
          {allCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-2">
                Check back later for new courses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allCourses.map((course) => (
                <ClassCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  instructor={course.teacher?.name || 'Instructor'}
                  duration={course.lessons?.[0]?.durationMin || 0}
                  difficulty={course.level || 'All Levels'}
                  intensity="moderate"
                  focusAreas={[]}
                  thumbnailUrl={course.coverUrl || undefined}
                  likes={Math.floor(Math.random() * 1000)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
