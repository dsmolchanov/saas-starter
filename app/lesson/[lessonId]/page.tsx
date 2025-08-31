import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { classes, courses, users, focusAreas, teachers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LessonContent } from '@/components/lesson-content';

// Disable static prerendering for DB queries
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }): Promise<Metadata> {
  const { lessonId: lessonIdStr } = await params;
  const lessonId = lessonIdStr;
  
  try {
    const lesson = await db.query.classes.findFirst({
      where: eq(classes.id, lessonId),
      columns: {
        title: true,
        description: true,
      },
    });

    if (!lesson) {
      return { title: 'Lesson Not Found' };
    }

    return {
      title: lesson.title,
      description: lesson.description || `Watch ${lesson.title} - Yoga class`,
    };
  } catch (error) {
    return { title: 'Lesson' };
  }
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId: lessonIdStr } = await params;
  const lessonId = lessonIdStr;

  if (!lessonId) {
    return notFound();
  }

  // Fetch lesson with course and teacher information
  const lesson = await db.query.classes.findFirst({
    where: eq(classes.id, lessonId),
    with: {
      course: {
        with: {
          teacher: {
            columns: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
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
              instagramUrl: true,
            },
          },
        },
      },
      focusAreas: {
        with: {
          focusArea: {
            columns: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return notFound();
  }

  // Transform the lesson data to match the client component props
  const lessonData = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    durationMin: lesson.durationMin,
    difficulty: lesson.difficulty,
    intensity: lesson.intensity,
    style: lesson.style,
    equipment: lesson.equipment,
    videoPath: lesson.videoPath,
    coverUrl: lesson.coverUrl,
    thumbnailUrl: lesson.thumbnailUrl,
    createdAt: lesson.createdAt,
    course: lesson.course ? {
      id: lesson.course.id,
      title: lesson.course.title,
      description: lesson.course.description,
      level: lesson.course.level,
    } : null,
    teacher: lesson.teacher ? {
      id: lesson.teacher.id,
      name: lesson.teacher.name,
      avatarUrl: lesson.teacher.avatarUrl,
      teacherProfile: lesson.teacher.teacherProfile ? {
        bio: lesson.teacher.teacherProfile.bio,
        instagramUrl: lesson.teacher.teacherProfile.instagramUrl,
      } : null,
    } : null,
    focusAreas: lesson.focusAreas,
  };

  return (
    <LessonContent 
      lesson={lessonData}
      videoUrl={(lesson as any).videoUrl}
      videoType={(lesson as any).videoType}
      muxPlaybackId={(lesson as any).muxPlaybackId}
    />
  );
}

