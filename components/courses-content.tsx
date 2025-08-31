'use client';

import { Button } from '@/components/ui/button';
import { Clock, Play, List, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { BrowseFilters } from '@/components/browse-filters';
import { BrowseSearch } from '@/components/browse-search';
import { useTranslations } from '@/components/providers/simple-intl-provider';
import { ContentCard, ContentCardGrid } from '@/components/ui/content-card';

interface CourseData {
  id: string;
  title: string;
  coverUrl: string | null;
  classes?: Array<{ id: string }> | null;
  category?: {
    id: string;
    title: string;
  } | null;
  teacher?: {
    id: string;
    name: string | null;
  } | null;
}

interface CoursesContentProps {
  allCourses: CourseData[];
  availableFilters: {
    levels: Array<{ value: string; label: string; count: number }>;
    categories: Array<{ value: string; label: string; count: number }>;
  };
  searchQuery: string;
}

export function CoursesContent({ allCourses, availableFilters, searchQuery }: CoursesContentProps) {
  const t = useTranslations('courses');
  const tCommon = useTranslations('common');
  const tBrowse = useTranslations('browse');
  const tClasses = useTranslations('classes');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{tBrowse('title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('findPerfectCourse')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <BrowseSearch placeholder={t('searchPlaceholder')} />
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button variant="ghost" className="px-4 py-2" size="sm" asChild>
              <Link href="/classes">{tClasses('classes')}</Link>
            </Button>
            <Button variant="ghost" className="px-4 py-2 bg-background shadow-sm" size="sm">
              {t('courses')}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <BrowseFilters availableFilters={availableFilters} type="courses" />
            
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {allCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-medium">{t('noCoursesFound')}</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery 
                ? t('noResultsForSearch').replace('{{query}}', searchQuery)
                : t('checkBackLater')}
            </p>
          </div>
        ) : (
          <ContentCardGrid>
            {allCourses.map((course) => (
              <ContentCard
                key={course.id}
                href={`/course/${course.id}`}
                title={course.title}
                subtitle={`${t('by')} ${course.teacher?.name || t('instructor')}`}
                image={course.coverUrl}
                badge={`${course.classes?.length || 0} ${course.classes?.length === 1 ? t('class') : t('classes')}`}
                badgeVariant="secondary"
                aspectRatio="video"
                size="md"
              />
            ))}
          </ContentCardGrid>
        )}
      </div>
    </div>
  );
}