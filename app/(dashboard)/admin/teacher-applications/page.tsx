import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

async function getTeacherApplications(): Promise<TeacherApplication[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/teacher-applications`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch applications:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.applications || [];
  } catch (error) {
    console.error('Error fetching teacher applications:', error);
    return [];
  }
}

export default async function TeacherApplicationsPage() {
  const user = await getUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const applications = await getTeacherApplications();

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teacher Applications</h1>
        <p className="text-muted-foreground">
          Review and manage teacher applications for Dzen Yoga
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              Teacher applications will appear here when users submit them.
            </p>
          </CardContent>
        </Card>
      ) : (
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
                    <form action={`/api/admin/teacher-applications/${application.id}`} method="POST" className="space-y-4">
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
                        <Button 
                          type="submit" 
                          name="status" 
                          value="approved"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          type="submit" 
                          name="status" 
                          value="rejected"
                          variant="destructive"
                        >
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
      )}
    </div>
  );
} 