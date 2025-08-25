'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Clock, User, Target, Zap, Heart, Calendar, ArrowLeft } from 'lucide-react';
import { FavoriteButton } from '@/components/favorite-button';
import { VideoPlayer } from '@/components/video-player';
import { useTranslations } from '@/components/providers/simple-intl-provider';

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    durationMin: number;
    difficulty: string | null;
    intensity: string | null;
    style: string | null;
    equipment: string | null;
    videoPath: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    createdAt: Date;
    course?: {
      id: string;
      title: string;
      description: string | null;
      level: string | null;
    } | null;
    teacher?: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
      teacherProfile?: {
        bio: string | null;
        instagramUrl: string | null;
      } | null;
    } | null;
    focusAreas: Array<{
      focusArea: {
        id: number;
        name: string;
        icon: string | null;
      };
    }>;
  };
  videoUrl?: string;
  videoType?: string;
  muxPlaybackId?: string;
}

export function LessonContent({ lesson, videoUrl, videoType, muxPlaybackId }: LessonContentProps) {
  const t = useTranslations('lesson');
  const tCommon = useTranslations('common');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Video Player Section */}
      <div className="relative w-full aspect-video bg-black">
        <VideoPlayer
          videoPath={lesson.videoPath}
          videoUrl={videoUrl}
          videoType={videoType}
          muxPlaybackId={muxPlaybackId}
          thumbnailUrl={lesson.imageUrl || lesson.thumbnailUrl}
          title={lesson.title}
          className="w-full h-full"
        />
        
        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Button asChild variant="secondary" size="sm" className="bg-black/50 hover:bg-black/70 text-white border-0">
            <Link href="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tCommon('back')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.durationMin} {t('minutes')}</span>
                </div>
                {lesson.difficulty && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{lesson.difficulty}</span>
                  </div>
                )}
                {lesson.intensity && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>{lesson.intensity} {t('intensity')}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {lesson.style && (
                  <Badge variant="secondary">{lesson.style}</Badge>
                )}
                {lesson.focusAreas.map((fa) => (
                  <Badge key={fa.focusArea.id} variant="outline">
                    {fa.focusArea.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            {lesson.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t('aboutThisClass')}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Equipment */}
            {lesson.equipment && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t('equipmentNeeded')}</h2>
                <div className="flex flex-wrap gap-2">
                  {lesson.equipment.split(',').map((item, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {item.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Course Information */}
            {lesson.course && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t('partOfCourse')}</h2>
                <Link href="/courses" className="group">
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {lesson.course.title}
                    </h3>
                    {lesson.course.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {lesson.course.description}
                      </p>
                    )}
                    {lesson.course.level && (
                      <Badge variant="outline" className="mt-2">
                        {lesson.course.level}
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor */}
            {lesson.teacher && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                <h3 className="font-semibold mb-4 text-primary">{t('yourInstructor')}</h3>
                <Link href={`/teacher/${lesson.teacher.id}`} className="group block">
                  <div className="text-center mb-4">
                    <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-primary/20 ring-offset-2">
                      <AvatarImage 
                        src={lesson.teacher.avatarUrl || undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                        {lesson.teacher.name ? lesson.teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'YT'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                        {lesson.teacher.name || t('yogaInstructor')}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">{t('certifiedYogaTeacher')}</p>
                      {lesson.teacher.teacherProfile?.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {lesson.teacher.teacherProfile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  {lesson.teacher.teacherProfile?.instagramUrl && (
                    <div className="pt-3 border-t border-primary/20">
                      <p className="text-xs text-center text-muted-foreground">
                        {t('followOnInstagram')}
                      </p>
                    </div>
                  )}
                </Link>
              </div>
            )}

            {/* Class Stats */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4">{t('classDetails')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('duration')}</span>
                  <span className="text-sm font-medium">{lesson.durationMin} {t('min')}</span>
                </div>
                {lesson.difficulty && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('level')}</span>
                    <span className="text-sm font-medium capitalize">{lesson.difficulty}</span>
                  </div>
                )}
                {lesson.intensity && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('intensityLabel')}</span>
                    <span className="text-sm font-medium capitalize">{lesson.intensity}</span>
                  </div>
                )}
                {lesson.style && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('style')}</span>
                    <span className="text-sm font-medium">{lesson.style}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('created')}</span>
                  <span className="text-sm font-medium">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <FavoriteButton lessonId={lesson.id} />
              <Button variant="outline" className="w-full" size="lg">
                <Calendar className="w-4 h-4 mr-2" />
                {t('schedulePractice')}
              </Button>
            </div>

            {/* Related Focus Areas */}
            {lesson.focusAreas.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-semibold mb-4">{t('focusAreas')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {lesson.focusAreas.map((fa) => (
                    <div key={fa.focusArea.id} className="text-center p-3 rounded-lg border">
                      <div className="text-2xl mb-1">
                        {fa.focusArea.icon || '🧘'}
                      </div>
                      <p className="text-xs font-medium">{fa.focusArea.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}