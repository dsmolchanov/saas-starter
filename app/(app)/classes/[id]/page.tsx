import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { lessons, type Lesson, lessonFocusAreas, focusAreas } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Play, Clock, Heart, Share2, MessageSquare, Bookmark, ArrowLeft, Edit } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoPlayer } from '@/components/video-player';
import { headers } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import Link from 'next/link';

// Locale detection function
async function getCurrentLocale(): Promise<string> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  if (pathname.startsWith('/en')) return 'en';
  if (pathname.startsWith('/es-MX')) return 'es-MX';
  return 'ru'; // default
}

// Locale-aware translations for class detail page
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      intensity: 'Интенсивность',
      noDescriptionAvailable: 'Описание недоступно',
      classDetails: 'Детали занятия',
      focusAreas: 'Области фокуса',
      equipment: 'Оборудование',
      instructor: 'Инструктор',
      course: 'Курс',
      follow: 'Подписаться',
      upNext: 'Далее',
      nextLesson: 'Следующий урок',
      min: 'мин',
      hour: 'ч',
      hourShort: 'ч',
      minuteShort: 'м',
      backToTeacherView: 'Назад к управлению',
      editClass: 'Редактировать занятие'
    },
    en: {
      intensity: 'Intensity',
      noDescriptionAvailable: 'No description available',
      classDetails: 'Class Details',
      focusAreas: 'Focus Areas',
      equipment: 'Equipment',
      instructor: 'Instructor',
      course: 'Course',
      follow: 'Follow',
      upNext: 'Up Next',
      nextLesson: 'Next Lesson',
      min: 'min',
      hour: 'hour',
      hourShort: 'h',
      minuteShort: 'm',
      backToTeacherView: 'Back to Teacher View',
      editClass: 'Edit Class'
    },
    'es-MX': {
      intensity: 'Intensidad',
      noDescriptionAvailable: 'Descripción no disponible',
      classDetails: 'Detalles de la Clase',
      focusAreas: 'Áreas de Enfoque',
      equipment: 'Equipo',
      instructor: 'Instructor',
      course: 'Curso',
      follow: 'Seguir',
      upNext: 'A Continuación',
      nextLesson: 'Siguiente Lección',
      min: 'min',
      hour: 'hora',
      hourShort: 'h',
      minuteShort: 'm',
      backToTeacherView: 'Volver a Vista de Profesor',
      editClass: 'Editar Clase'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentLocale = await getCurrentLocale();
  const t = getTranslations(currentLocale);
  
  // Get current user to check if they are the teacher
  const currentUser = await getUser();
  
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, id),
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
  });

  if (!lesson) {
    notFound();
  }

  // Check if current user is the teacher who owns this class
  const isTeacherOwner = currentUser && currentUser.id === lesson.teacherId;

  // Format duration with locale-aware text
  const hours = Math.floor(lesson.durationMin / 60);
  const minutes = lesson.durationMin % 60;
  const duration = hours > 0 
    ? `${hours}${t.hourShort} ${minutes}${t.minuteShort}`
    : `${minutes}${t.minuteShort}`;
  
  // Get focus areas as an array of strings
  const focusAreaNames = lesson.focusAreas.map(fa => fa.focusArea.name);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button for teacher owners */}
      {isTeacherOwner && (
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            asChild
            className="gap-2 hover:bg-muted"
          >
            <Link href="/my_practice">
              <ArrowLeft className="w-4 h-4" />
              {t.backToTeacherView}
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            asChild
            className="gap-2"
          >
            <Link href={`/my_practice?edit=${id}`}>
              <Edit className="w-4 h-4" />
              {t.editClass}
            </Link>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <VideoPlayer
            videoPath={lesson.videoPath}
            videoUrl={lesson.videoUrl}
            videoType={lesson.videoType}
            thumbnailUrl={lesson.thumbnailUrl}
            title={lesson.title}
            className="rounded-xl"
          />

          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-sm">{lesson.difficulty}</Badge>
              <Badge variant="secondary" className="text-sm">{lesson.intensity} {t.intensity}</Badge>
              {lesson.style && (
                <Badge variant="secondary" className="text-sm">{lesson.style}</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-muted-foreground mb-6">
              {lesson.description || t.noDescriptionAvailable}
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
              <h3 className="font-semibold text-lg">{t.classDetails}</h3>
              
              {focusAreaNames.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t.focusAreas}</h4>
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
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{t.equipment}</h4>
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
                  {lesson.course?.teacher?.name || t.instructor}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lesson.course?.title || t.course}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              {t.follow}
            </Button>
          </div>

          <div className="bg-card rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">{t.upNext}</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-20 h-12 bg-muted rounded-md flex-shrink-0">
                    {/* Thumbnail placeholder */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.nextLesson} {i}</p>
                    <p className="text-xs text-muted-foreground">15 {t.min}</p>
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
