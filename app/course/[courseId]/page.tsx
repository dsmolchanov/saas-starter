import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { courses, lessons, teachers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, User, BookOpen } from 'lucide-react';
import { BackButton } from '@/components/back-button';

export const metadata = {
  title: 'Course'
};

// This page needs dynamic rendering for dynamic routes and i18n
export const dynamic = 'force-dynamic';

export default async function CoursePage({ params }: any) {
  const { courseId } = params;

  // Fetch course details with lessons and teacher info
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      classes: {
        orderBy: (classes, { asc }) => [asc(classes.createdAt)],
      },
      teacher: {
        columns: {
          id: true,
          name: true,
          avatarUrl: true,
        },
        with: {
          teacherProfile: {
            columns: {
              bio: true,
            }
          }
        }
      }
    }
  });

  if (!course) return notFound();

  const totalDuration = course.classes.reduce((total, lesson) => total + (lesson.durationMin || 0), 0);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4 relative">
              {course.coverUrl ? (
                <Image
                  src={course.coverUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <BookOpen className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              {course.level && (
                <Badge variant="secondary">{course.level}</Badge>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {formatDuration(totalDuration)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Play className="w-4 h-4 mr-1" />
                {course.classes.length} {course.classes.length === 1 ? 'lesson' : 'lessons'}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            {course.description && (
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Course Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Course Content
              </CardTitle>
              <CardDescription>
                {course.classes.length} {course.classes.length === 1 ? 'lesson' : 'lessons'} • {formatDuration(totalDuration)} total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.classes.length > 0 ? (
                course.classes.map((lesson, index) => (
                  <Link key={lesson.id} href={`/classes/${lesson.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {lesson.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {lesson.durationMin && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(lesson.durationMin)}
                            </span>
                          )}
                          {lesson.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {lesson.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>This course doesn't have any lessons yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Instructor Info */}
        <div className="space-y-6">
          {course.teacher && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/teacher/${course.teacher.id}`} className="block group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      {course.teacher.avatarUrl ? (
                        <Image
                          src={course.teacher.avatarUrl}
                          alt={course.teacher.name || 'Instructor'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-lg font-medium text-primary">
                            {course.teacher.name?.[0]?.toUpperCase() || 'I'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {course.teacher.name || 'Instructor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">Yoga Instructor</p>
                    </div>
                  </div>
                </Link>
                {course.teacher.teacherProfile?.bio && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {course.teacher.teacherProfile.bio}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Start Course Button */}
          {course.classes.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Link href={`/classes/${course.classes[0].id}`}>
                  <Button className="w-full gap-2">
                    <Play className="w-4 h-4" />
                    Start Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
