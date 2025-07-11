import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { users, teachers, classes, courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassCard } from '@/components/class-card';
import { Play, Clock, BookOpen, Users, Instagram, ArrowLeft } from 'lucide-react';

// Disable static prerendering for DB queries
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ teacherId: string }> }): Promise<Metadata> {
  const { teacherId } = await params;
  
  try {
    const teacher = await db.query.users.findFirst({
      where: eq(users.id, teacherId),
      columns: {
        name: true,
      },
    });

    if (!teacher) {
      return { title: 'Teacher Not Found' };
    }

    return {
      title: `${teacher.name || 'Yoga Teacher'} - Instructor Profile`,
      description: `Learn more about ${teacher.name || 'this yoga instructor'} and explore their classes and courses.`,
    };
  } catch (error) {
    return { title: 'Teacher Profile' };
  }
}

// Helper function to format Instagram URL
function formatInstagramUrl(instagramUrl: string): string {
  if (!instagramUrl) return '';
  
  // If it already starts with http, return as is
  if (instagramUrl.startsWith('http')) {
    return instagramUrl;
  }
  
  // Remove @ symbol if present and add Instagram base URL
  const username = instagramUrl.replace('@', '');
  return `https://instagram.com/${username}`;
}

export default async function TeacherPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;

  if (!teacherId) {
    return notFound();
  }

  // Fetch teacher with profile information
  const teacher = await db.query.users.findFirst({
    where: eq(users.id, teacherId),
    with: {
      teacherProfile: {
        columns: {
          bio: true,
          instagramUrl: true,
          revenueShare: true,
        },
      },
    },
  });

  if (!teacher || !teacher.teacherProfile) {
    return notFound();
  }

  // Fetch teacher's courses
  const teacherCourses = await db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    with: {
      classes: {
        columns: { id: true },
      },
    },
  });

  // Fetch teacher's standalone classes (not part of courses)
  const standaloneClasses = await db.query.classes.findMany({
    where: eq(classes.teacherId, teacherId),
    with: {
      focusAreas: {
        with: {
          focusArea: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Separate standalone classes from course classes
  const courseClassIds = teacherCourses.flatMap(course => course.classes.map(c => c.id));
  const trueStandaloneClasses = standaloneClasses.filter(c => !courseClassIds.includes(c.id));

  const totalClasses = standaloneClasses.length;
  const totalCourses = teacherCourses.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/teachers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teachers
              </Link>
            </Button>
          </div>

          {/* Teacher Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="text-center md:text-left">
              <Avatar className="w-32 h-32 mx-auto md:mx-0 mb-4 ring-4 ring-primary/20 ring-offset-4">
                <AvatarImage 
                  src={teacher.avatarUrl || undefined} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-medium">
                  {teacher.name ? teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'YT'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{teacher.name || 'Yoga Teacher'}</h1>
              <p className="text-xl text-muted-foreground mb-4">Certified Yoga Instructor</p>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <BookOpen className="w-6 h-6" />
                    {totalCourses}
                  </div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <Play className="w-6 h-6" />
                    {totalClasses}
                  </div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
              </div>

              {/* Instagram Button */}
              {teacher.teacherProfile.instagramUrl && (
                <Button asChild variant="outline" className="gap-2">
                  <a 
                    href={formatInstagramUrl(teacher.teacherProfile.instagramUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-4 h-4" />
                    Follow on Instagram
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="courses">Courses ({totalCourses})</TabsTrigger>
                <TabsTrigger value="classes">Classes ({totalClasses})</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                {/* Bio */}
                {teacher.teacherProfile.bio && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">About {teacher.name?.split(' ')[0] || 'Me'}</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {teacher.teacherProfile.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Teaching Philosophy or additional content could go here */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Teaching Style</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Experience yoga classes that blend traditional techniques with modern approaches, 
                    designed to meet you wherever you are in your practice journey.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                {teacherCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No courses yet</h3>
                    <p className="text-muted-foreground">Check back later for new course offerings.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teacherCourses.map((course) => (
                      <Link key={course.id} href={`/course/${course.id}`} className="group">
                        <div className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                          {course.imageUrl && (
                            <div className="aspect-video rounded-lg overflow-hidden mb-4">
                              <Image
                                src={course.imageUrl}
                                alt={course.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {course.level && (
                              <Badge variant="outline">{course.level}</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {course.classes.length} {course.classes.length === 1 ? 'class' : 'classes'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="classes" className="space-y-6">
                {trueStandaloneClasses.length === 0 ? (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No standalone classes yet</h3>
                    <p className="text-muted-foreground">All classes are part of courses.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trueStandaloneClasses.map((classItem) => (
                      <ClassCard
                        key={classItem.id}
                        id={classItem.id}
                        title={classItem.title}
                        instructor={teacher.name || 'Instructor'}
                        duration={classItem.durationMin || 0}
                        difficulty={classItem.difficulty || 'All Levels'}
                        intensity={classItem.intensity?.toLowerCase() || 'moderate'}
                        focusAreas={classItem.focusAreas.map(fa => fa.focusArea.name)}
                        thumbnailUrl={classItem.thumbnailUrl || undefined}
                        likes={Math.floor(Math.random() * 1000)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Teaching Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Courses</span>
                  <span className="text-sm font-medium">{totalCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Classes</span>
                  <span className="text-sm font-medium">{totalClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="text-sm font-medium">Certified Instructor</span>
                </div>
              </div>
            </div>

            {/* Contact/Social */}
            {teacher.teacherProfile.instagramUrl && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
                <h3 className="font-semibold mb-4">Connect</h3>
                <Button asChild className="w-full gap-2">
                  <a 
                    href={formatInstagramUrl(teacher.teacherProfile.instagramUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-4 h-4" />
                    Follow on Instagram
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 