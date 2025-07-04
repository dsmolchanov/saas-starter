import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Courses'
};

export default function AdminCoursesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Admin · Courses</h1>
      <p className="text-muted-foreground">CRUD interface for courses coming soon...</p>
    </div>
  );
}
