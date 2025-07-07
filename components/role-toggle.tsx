"use client";

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RoleToggle({
  defaultRole = 'student',
  onChange
}: {
  defaultRole?: 'student' | 'teacher';
  onChange?: (role: 'student' | 'teacher') => void;
}) {
  const [role, setRole] = useState<'student' | 'teacher'>(defaultRole);

  function handleChange(value: string) {
    const r = value === 'teacher' ? 'teacher' : 'student';
    setRole(r);
    onChange?.(r);
  }

  return (
    <Tabs value={role} onValueChange={handleChange} className="w-full">
      <TabsList className="w-full justify-between bg-transparent border-b border-border rounded-none p-0 mb-6">
        <TabsTrigger value="student" className="flex-1 data-[state=active]:border-b-2 border border-transparent rounded-none py-2 text-sm tracking-wide uppercase">
          I AM STUDENT
        </TabsTrigger>
        <TabsTrigger value="teacher" className="flex-1 data-[state=active]:border-b-2 border border-transparent rounded-none py-2 text-sm tracking-wide uppercase">
          I AM TEACHER
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default RoleToggle; 