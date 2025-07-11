"use client";

import { useState, useEffect } from 'react';
import { PhotoUpload } from '@/components/photo-upload';
import { TeacherDashboard } from '@/components/teacher-dashboard';
import { TeacherOnboarding } from '@/components/teacher-onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle 
} from 'lucide-react';

interface TeacherApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  avatarUrl?: string;
  teacherApplicationStatus?: string | null;
}

export function MyPracticeUI({ user, initialRole }: { user: User, initialRole: 'student' | 'teacher' }) {
  const [showTeacherOnboarding, setShowTeacherOnboarding] = useState(false);
  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check teacher application status
    fetch('/api/teacher-application')
      .then(r => r.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error checking application status:', err);
        setLoading(false);
      });
  }, []);

  const handleStartApplication = () => {
    setShowTeacherOnboarding(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      const data = await res.json();

      if (res.ok) {
        setApplication(data.application);
        setShowTeacherOnboarding(false);
        // Refresh the page to update the user status
        window.location.reload();
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
    setSubmitting(false);
  };

  const handleCancelApplication = () => {
    setShowTeacherOnboarding(false);
  };

  // If user is already a teacher, show teacher dashboard
  if (initialRole === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-6">
          <PhotoUpload userId={user.id} initialUrl={user.avatarUrl} />
          <h2 className="font-bold text-xl uppercase text-center mt-2">{user.name}</h2>
          <Badge variant="default" className="mt-2">
            <Star className="w-3 h-3 mr-1" />
            Teacher
          </Badge>
        </div>

        <TeacherDashboard user={user} />
      </div>
    );
  }

  // Show onboarding flow if in progress
  if (showTeacherOnboarding) {
    return (
      <TeacherOnboarding 
        onComplete={handleApplicationSubmit}
        onCancel={handleCancelApplication}
      />
    );
  }

  // Show teacher application status or button
  return (
    <div className="space-y-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-6">
        <PhotoUpload userId={user.id} initialUrl={user.avatarUrl} />
        <h2 className="font-bold text-xl uppercase text-center mt-2">{user.name}</h2>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : application ? (
        // Show application status
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                {application.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                {application.status === 'under_review' && <AlertCircle className="w-5 h-5 text-blue-500" />}
                {application.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {application.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                Teacher Application
              </CardTitle>
              <Badge 
                variant={
                  application.status === 'approved' ? 'default' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
              >
                {application.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Submitted on {new Date(application.submittedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {application.status === 'pending' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your teacher application is being reviewed. We'll notify you via email once a decision is made.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What's next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Review process typically takes 2-3 business days</li>
                    <li>• We'll email you with the decision</li>
                    <li>• If approved, you'll get immediate access to teacher tools</li>
                  </ul>
                </div>
              </div>
            )}

            {application.status === 'under_review' && (
              <p className="text-sm text-muted-foreground">
                Your application is currently under detailed review. We'll update you soon!
              </p>
            )}

            {application.status === 'approved' && (
              <div className="space-y-4">
                <p className="text-sm text-green-700">
                  Congratulations! Your teacher application has been approved. You now have access to all teacher features.
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Access Teacher Dashboard
                </Button>
              </div>
            )}

            {application.status === 'rejected' && (
              <div className="space-y-4">
                <p className="text-sm text-red-700">
                  Unfortunately, your application was not approved at this time. You can submit a new application after addressing any feedback.
                </p>
                <Button 
                  onClick={handleStartApplication} 
                  variant="outline" 
                  className="w-full"
                >
                  Submit New Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Show teacher application prompt
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Become a Teacher
            </CardTitle>
            <CardDescription>
              Share your passion for yoga and earn revenue by teaching on our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Create Courses</h3>
                <p className="text-xs text-muted-foreground">Build structured learning experiences</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Global Reach</h3>
                <p className="text-xs text-muted-foreground">Teach students worldwide</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">💰 Revenue Share Model</h4>
              <p className="text-sm text-green-800">
                Earn 70% of subscription revenue from students who attend your classes each month.
              </p>
            </div>

            <Button 
              onClick={handleStartApplication} 
              className="w-full" 
              size="lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Request to be a Teacher'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Application process takes 5-10 minutes. We'll review within 2-3 business days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 