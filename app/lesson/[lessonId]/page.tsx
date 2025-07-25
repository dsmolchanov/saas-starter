import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { lessonId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Lesson ${params.lessonId}` };
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = params;

  // TODO: fetch lesson details and video URL from Supabase here
  const lesson = null;
  if (!lesson) return notFound();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Lesson {lessonId}</h1>
      <p className="text-muted-foreground">Video player coming soon...</p>
    </div>
  );
}
