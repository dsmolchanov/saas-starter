import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Lessons'
};

export default function AdminLessonsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Admin · Lessons</h1>
      <p className="text-muted-foreground">CRUD interface for lessons coming soon...</p>
    </div>
  );
}
