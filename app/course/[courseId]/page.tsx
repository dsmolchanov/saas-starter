import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { courseId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Course ${params.courseId}` };
}

export default async function CoursePage({ params }: Props) {
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
