import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Course'
};

// This page needs dynamic rendering for dynamic routes and i18n
export const dynamic = 'force-dynamic';

export default async function CoursePage({ params }: any) {
  const { courseId } = params;

  // TODO: fetch course details from Supabase here
  const course = null;
  if (!course) return notFound();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Course {courseId}</h1>
      <p className="text-muted-foreground">Course details coming soon...</p>
    </div>
  );
}
