'use client';

import { useState, useEffect } from 'react';
import { VoiceSession } from '@/components/voice-session';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mic, Info } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VoiceClassClientProps {
  classId: string;
}

interface ClassData {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  duration: number;
  style: string;
  level: string;
  teachers?: {
    name: string;
    ai_enabled: boolean;
  };
}

export default function VoiceClassClient({ classId }: VoiceClassClientProps) {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      // In a real app, you'd fetch this from your API
      // For now, using mock data
      setClassData({
        id: classId,
        title: 'Morning Vinyasa Class',
        description: 'Start your day with this energizing vinyasa practice',
        teacher_id: 'teacher-123',
        duration: 45,
        style: 'Vinyasa',
        level: 'Intermediate',
        teachers: {
          name: 'Sarah Johnson',
          ai_enabled: true
        }
      });
    } catch (err) {
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionEnd = (sessionId: string) => {
    // Navigate to session summary or analytics page
    console.log('Session ended:', sessionId);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Class not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/classes/${classId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Class
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Voice AI Mode</span>
        </div>
      </div>

      {/* Class Info */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{classData.title}</h1>
        <p className="text-muted-foreground mb-4">{classData.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span>{classData.duration} minutes</span>
          <span>•</span>
          <span>{classData.style}</span>
          <span>•</span>
          <span>{classData.level}</span>
        </div>
      </Card>

      {/* AI Features Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Voice AI Features:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Real-time pose guidance and corrections</li>
            <li>• Personalized modifications based on your needs</li>
            <li>• Breathing cues synchronized with movement</li>
            <li>• Interactive Q&A during practice</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Voice Session Component */}
      <VoiceSession
        classId={classId}
        classTitle={classData.title}
        teacherName={classData.teachers?.name || 'Instructor'}
        onSessionEnd={handleSessionEnd}
      />

      {/* Practice Tips */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Before You Begin:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Ensure your microphone is working properly</li>
          <li>✓ Find a quiet space with minimal background noise</li>
          <li>✓ Have your yoga mat and any props ready</li>
          <li>✓ Position your device where you can hear clearly</li>
          <li>✓ Remember you can ask questions anytime during practice</li>
        </ul>
      </Card>
    </div>
  );
}