// Dynamic content creation page
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { ContentCreator } from '@/components/teacher-studio/content-creator';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function CreateContentPage({ params }: PageProps) {
  const { type } = await params;
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user is a teacher
  if (user.role !== 'teacher' && user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  // Validate content type
  const validTypes = [
    'class',
    'breathing',
    'asana',
    'quick_flow',
    'challenge',
    'meditation',
    'live_class',
    'workshop',
    'program'
  ];
  
  if (!validTypes.includes(type)) {
    redirect('/teacher-studio');
  }
  
  return <ContentCreator contentType={type} userId={user.id} />;
}