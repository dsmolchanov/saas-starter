"use client";

import { useState } from 'react';
import { RoleToggle } from '@/components/role-toggle';
import { PhotoUpload } from '@/components/photo-upload';
import { TeacherProfileForm } from '@/components/teacher-profile-form';
import { LessonUploadForm } from '@/components/lesson-upload-form';

export function MyPracticeUI({ user, initialRole }: { user: { id: number; name: string; avatarUrl?: string }, initialRole: 'student' | 'teacher' }) {
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);

  return (
    <>
      <RoleToggle defaultRole={initialRole} onChange={(r) => setRole(r)} />

      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-6">
        <PhotoUpload userId={user.id} initialUrl={user.avatarUrl} />
        <h2 className="font-bold text-xl uppercase text-center mt-2">{user.name}</h2>
      </div>

      {role === 'teacher' && (
        <>
          <TeacherProfileForm />
          <LessonUploadForm userId={user.id} />
        </>
      )}    
    </>
  );
} 