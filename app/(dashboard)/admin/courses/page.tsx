import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Courses'
};

// This page needs dynamic rendering for i18n
export const dynamic = 'force-dynamic';

export default function AdminCoursesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Admin · Courses</h1>
      <p className="text-muted-foreground">CRUD interface for courses coming soon...</p>
    </div>
  );
}
