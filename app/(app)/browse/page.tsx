import { db } from '@/lib/db/drizzle';
import { teachers, courses } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { InstructorCard } from '@/components/instructor-card';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default async function BrowsePage() {
  // Fetch featured teachers (instructors) with user data
  const featuredTeachers = await db.query.teachers.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    limit: 8,
  });

  // Fetch featured courses (playlists) with teacher and lesson count
  const featuredCourses = await db.query.courses.findMany({
    with: {
      lessons: {
        columns: { id: true },
      },
    },
    limit: 8,
  });

  // Fetch teachers for the courses
  const courseTeachers = await db.query.teachers.findMany({
    where: inArray(
      teachers.id,
      featuredCourses.map(c => c.teacherId).filter(Boolean) as number[]
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
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <BackButton />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Browse</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Discover amazing instructors and curated playlists
          </p>
        </div>
        <div className="ml-auto sm:hidden">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Instructors Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Instructors</h2>
          <Link 
            href="/instructors" 
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {featuredTeachers.map((teacher) => {
            const user = teacher.user || { name: 'Instructor' };
            return (
              <InstructorCard
                key={teacher.id}
                id={teacher.id}
                name={user.name}
                bio={teacher.bio || 'Yoga Instructor'}
              />
            );
          })}
        </div>
      </section>

      {/* Playlists (Courses) Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Playlists</h2>
          <Link 
            href="/courses" 
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
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
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
