"use client";

import { useEffect, useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react';

interface TeacherApplication {
  id: string;
  userId: string;
  experienceLevel: string;
  trainingBackground: string;
  offlinePractice?: string;
  regularStudentsCount?: string;
  revenueModel: string;
  motivation?: string;
  additionalInfo?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export function AdminDashboard() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/teacher-applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const status = formData.get('status') as string;
    const reviewNotes = formData.get('reviewNotes') as string;
    await fetch(`/api/admin/teacher-applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes }),
    });
    // refresh
    const res = await fetch('/api/admin/teacher-applications');
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">Teacher applications will appear here when users submit them.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  {application.user.name || 'Unknown User'}
                  {getStatusBadge(application.status)}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {application.user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Experience Level
                </Label>
                <p className="text-sm capitalize">{application.experienceLevel.replace('_', ' ')}</p>
              </div>
              {application.regularStudentsCount && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Regular Students
                  </Label>
                  <p className="text-sm">{application.regularStudentsCount}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Revenue Model
                </Label>
                <p className="text-sm capitalize">{application.revenueModel.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Training Background
                </Label>
                <p className="text-sm mt-1">{application.trainingBackground}</p>
              </div>

              {application.offlinePractice && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Current Practice
                  </Label>
                  <p className="text-sm mt-1">{application.offlinePractice}</p>
                </div>
              )}

              {application.motivation && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Motivation
                  </Label>
                  <p className="text-sm mt-1">{application.motivation}</p>
                </div>
              )}

              {application.additionalInfo && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Additional Information
                  </Label>
                  <p className="text-sm mt-1">{application.additionalInfo}</p>
                </div>
              )}
            </div>

            {application.status === 'pending' && (
              <div className="border-t pt-4">
                <form onSubmit={(e) => handleSubmit(e, application.id)} className="space-y-4">
                  <div>
                    <Label htmlFor={`notes-${application.id}`}>Review Notes (Optional)</Label>
                    <Textarea
                      id={`notes-${application.id}`}
                      name="reviewNotes"
                      placeholder="Add any feedback or notes for the applicant..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" name="status" value="approved" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button type="submit" name="status" value="rejected" variant="destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {application.status !== 'pending' && application.reviewNotes && (
              <div className="border-t pt-4">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Review Notes
                </Label>
                <p className="text-sm mt-1">{application.reviewNotes}</p>
                {application.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
