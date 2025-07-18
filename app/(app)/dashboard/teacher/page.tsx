// This page needs dynamic rendering for user authentication
export const dynamic = 'force-dynamic';

import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { TeacherDashboard } from '@/components/teacher-dashboard';

export default async function TeacherDashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile, courses, and classes
          </p>
        </div>
        
        <TeacherDashboard user={user} />
      </div>
    </div>
  );
} 