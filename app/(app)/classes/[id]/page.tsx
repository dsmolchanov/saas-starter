import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { lessons, type Lesson, lessonFocusAreas, focusAreas } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Play, Clock, Heart, Share2, MessageSquare, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default async function ClassPage({ params }: any) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, parseInt(params.id)),
    with: {
      course: true,
      focusAreas: {
        with: {
          focusArea: true,
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Format duration
  const duration = `${Math.floor(lesson.durationMin / 60)}h ${lesson.durationMin % 60}m`;
  
  // Get focus areas as an array of strings
  const focusAreaNames = lesson.focusAreas.map(fa => fa.focusArea.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-xl aspect-video relative overflow-hidden">
            {/* Replace with actual video player */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button size="lg" className="rounded-full w-16 h-16 p-0">
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {duration}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-sm">{lesson.difficulty}</Badge>
              <Badge variant="secondary" className="text-sm">{lesson.intensity} Intensity</Badge>
              {lesson.style && (
                <Badge variant="secondary" className="text-sm">{lesson.style}</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground mb-6">
              {lesson.description || 'No description available'}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>1.2k</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>24</span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Class Details</h3>
              
              {focusAreaNames.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {focusAreaNames.map((area) => (
                      <Badge key={area} variant="outline" className="text-sm">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {lesson.equipment && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Equipment</h4>
                  <p className="text-sm">{lesson.equipment}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="font-medium">
                  {lesson.course?.teacher?.name?.[0] || 'T'}
                </span>
              </div>
              <div>
                <h4 className="font-medium">
                  {lesson.course?.teacher?.name || 'Instructor'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lesson.course?.title || 'Course'}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Follow
            </Button>
          </div>

          <div className="bg-card rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Up Next</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-20 h-12 bg-muted rounded-md flex-shrink-0">
                    {/* Thumbnail placeholder */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Next Lesson {i}</p>
                    <p className="text-xs text-muted-foreground">15 min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
