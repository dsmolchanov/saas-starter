'use client';

import { InstructorCard } from '@/components/instructor-card';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/components/providers/simple-intl-provider';
import { useState } from 'react';

interface TeacherData {
  id: string;
  bio: string | null;
  instagramUrl: string | null;
  revenueShare: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
}

interface TeachersContentProps {
  allTeachers: TeacherData[];
}

export function TeachersContent({ allTeachers }: TeachersContentProps) {
  const t = useTranslations('teachers');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter teachers based on search query
  const filteredTeachers = allTeachers
    .filter((teacher) => teacher.user && teacher.user.id) // Only show teachers with valid user records
    .filter((teacher) => {
      if (!searchQuery) return true;
      const name = teacher.user?.name?.toLowerCase() || '';
      const bio = teacher.bio?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || bio.includes(query);
    });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {t('filters')}
        </Button>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-medium">{t('noTeachersFound')}</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery 
              ? t('noResultsForSearch').replace('{{query}}', searchQuery)
              : t('checkBackLater')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredTeachers.map((teacher) => {
            const user = teacher.user!; // Safe to use ! after filter
            return (
              <InstructorCard
                key={teacher.id}
                id={user.id}
                name={user.name}
                imageUrl={user.avatarUrl}
                bio={teacher.bio || t('defaultBio')}
                className=""
              />
            );
          })}
        </div>
      )}
    </div>
  );
}