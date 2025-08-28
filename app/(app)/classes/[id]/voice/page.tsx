import VoiceClassClient from './voice-class-client';

export default async function VoiceClassPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <VoiceClassClient classId={id} />;
}