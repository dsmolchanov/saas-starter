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
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('profile');

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
              <CardTitle className="text-2xl">{user.name || 'Teacher'}</CardTitle>
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
            Profile
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Edit Profile
              </CardTitle>
              <CardDescription>
                Update your bio and social media information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CourseManager />
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <ClassManager userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 