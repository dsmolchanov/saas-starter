"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeacherProfileForm } from '@/components/teacher-profile-form';
import { CourseManager } from '@/components/course-manager';
import { ClassManager } from '@/components/class-manager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, BookOpen, Play, Settings } from 'lucide-react';

interface TeacherDashboardProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl?: string | null;
  };
  locale?: string;
}

// Locale-aware translations for TeacherDashboard
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      teacher: 'Преподаватель',
      profile: 'Профиль',
      courses: 'Курсы',
      classes: 'Занятия',
      editProfile: 'Редактировать профиль',
      updateBioSocial: 'Обновите вашу биографию и информацию в социальных сетях'
    },
    en: {
      teacher: 'Teacher',
      profile: 'Profile',
      courses: 'Courses',
      classes: 'Classes',
      editProfile: 'Edit Profile',
      updateBioSocial: 'Update your bio and social media information'
    },
    'es-MX': {
      teacher: 'Profesor',
      profile: 'Perfil',
      courses: 'Cursos',
      classes: 'Clases',
      editProfile: 'Editar Perfil',
      updateBioSocial: 'Actualiza tu biografía e información de redes sociales'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function TeacherDashboard({ user, locale = 'ru' }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const t = getTranslations(locale);

  return (
    <div className="space-y-6">
      {/* Teacher Profile Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-lg font-medium">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'T'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name || t.teacher}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t.profile}
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t.courses}
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            {t.classes}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t.editProfile}
              </CardTitle>
              <CardDescription>
                {t.updateBioSocial}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherProfileForm locale={locale} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CourseManager locale={locale} />
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <ClassManager userId={user.id} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 