'use client';

import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { BrowseFilters } from '@/components/browse-filters';
import { BrowseSearch } from '@/components/browse-search';
import { useTranslations } from '@/components/providers/simple-intl-provider';
import { ContentCard, ContentCardGrid } from '@/components/ui/content-card';

interface ClassData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  teacherId: string;
  description: string | null;
  coverUrl: string | null;
  courseId: string | null;
  durationMin: number;
  difficulty: string | null;
  intensity: string | null;
  thumbnailUrl: string | null;
  style: string | null;
  equipment: string | null;
  videoPath: string | null;
  videoUrl: string | null;
  videoType: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  muxUploadId: string | null;
  muxStatus: string | null;
  orderIndex: number | null;
  teacher: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    passwordHash: string | null;
    role: string;
    teacherApplicationStatus: string | null;
  } | null;
  focusAreas: Array<{
    id: string;
    classId: string;
    focusAreaId: string;
    focusArea: {
      id: string;
      name: string;
      icon: string | null;
    };
  }>;
}

interface ClassesContentProps {
  filteredClasses: ClassData[];
  availableFilters: {
    styles: Array<{ value: string; label: string; count: number }>;
    levels: Array<{ value: string; label: string; count: number }>;
    focusAreas: Array<{ value: string; label: string }>;
  };
  searchQuery: string;
}

export function ClassesContent({ filteredClasses, availableFilters, searchQuery }: ClassesContentProps) {
  const t = useTranslations('classes');
  const tCommon = useTranslations('common');
  const tBrowse = useTranslations('browse');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{tBrowse('title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('findPerfectClass')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <BrowseSearch />
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button variant="ghost" className="px-4 py-2 bg-background shadow-sm" size="sm">
              {t('classes')}
            </Button>
            <Button variant="ghost" className="px-4 py-2" size="sm" asChild>
              <Link href="/courses">{t('courses')}</Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <BrowseFilters availableFilters={availableFilters} type="classes" />
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-0">
          {filteredClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-xl font-medium">{t('noClassesFound')}</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery 
                  ? t('noResultsForSearch').replace('{{query}}', searchQuery)
                  : t('checkBackLater')}
              </p>
            </div>
          ) : (
            <ContentCardGrid>
              {filteredClasses.map((lesson) => (
                <ContentCard
                  key={lesson.id}
                  href={`/classes/${lesson.id}`}
                  title={lesson.title}
                  subtitle={lesson.teacher?.name || t('instructor')}
                  description={lesson.description}
                  image={lesson.thumbnailUrl || lesson.coverUrl}
                  duration={lesson.durationMin || 0}
                  difficulty={lesson.difficulty || t('allLevels')}
                  instructor={lesson.teacher?.name}
                  badge={lesson.difficulty || 'All Levels'}
                  badgeVariant="secondary"
                  aspectRatio="video"
                  size="md"
                />
              ))}
            </ContentCardGrid>
          )}
        </div>
      </div>
    </div>
  );
}