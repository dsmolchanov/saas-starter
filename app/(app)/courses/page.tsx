import { db } from '@/lib/db/drizzle';
import { courses, teachers } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Search, Filter, Clock, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

// Disable static prerender to avoid DB access at build time
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const allCourses = await db.query.courses.findMany({
    with: {
      lessons: {
        columns: { id: true },
      },
    },
  });

  // Fetch teachers for the courses
  const courseTeachers = await db.query.teachers.findMany({
    where: (teachers, { inArray }) => 
      inArray(
        teachers.id,
        allCourses.map(c => c.teacherId).filter(Boolean) as string[]
      ),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Create a map of teacherId to teacher data
  const teacherMap = new Map(
    courseTeachers.map(teacher => [teacher.id, teacher])
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Courses</h1>
        <p className="text-muted-foreground">
          Explore our curated collection of yoga courses
        </p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allCourses.map((course) => (
          <div key={course.id} className="group">
            <Link href={`/courses/${course.id}`}>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3 relative">
                {course.coverUrl ? (
                  <Image
                    src={course.coverUrl}
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
                  {course.lessons?.length || 0} {course.lessons?.length === 1 ? 'lesson' : 'lessons'}
                </div>
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  By {teacherMap.get(course.teacherId)?.user?.name || 'Instructor'}
                </p>
                {course.lessons && course.lessons.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.lessons.length} {course.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
