import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teacherApplications, users, teachers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// PUT - Update application status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT /api/admin/teacher-applications/[id] called');
    
    const user = await getUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      console.log('Unauthorized access attempt:', { userId: user?.id, role: user?.role });
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { status, reviewNotes } = body;

    if (!['approved', 'rejected'].includes(status)) {
      console.log('Invalid status provided:', status);
      return NextResponse.json({ error: 'Invalid status. Must be "approved" or "rejected"' }, { status: 400 });
    }

    // Await params before using them
    const { id } = await params;
    console.log('Application ID:', id);

    // Get the application to get user details
    const application = await db.query.teacherApplications.findFirst({
      where: eq(teacherApplications.id, id),
      with: {
        user: true
      }
    });
    console.log('Found application:', application ? 'yes' : 'no', application?.id);

    if (!application) {
      console.log('Application not found for ID:', id);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    console.log('Updating application status to:', status);
    // Update application status
    const [updatedApplication] = await db
      .update(teacherApplications)
      .set({
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      })
      .where(eq(teacherApplications.id, id))
      .returning();
    console.log('Application updated successfully');

    // If approved, update user status and create teacher profile
    if (status === 'approved') {
      console.log('Processing approval - updating user role and creating teacher profile');
      
      // Update user's teacher application status
      await db
        .update(users)
        .set({ 
          teacherApplicationStatus: 'approved',
          role: 'teacher' // Update role to teacher
        })
        .where(eq(users.id, application.userId));
      console.log('User role updated to teacher');

      // Create teacher profile if it doesn't exist
      const existingTeacher = await db.query.teachers.findFirst({
        where: eq(teachers.id, application.userId)
      });
      console.log('Existing teacher profile:', existingTeacher ? 'yes' : 'no');

      if (!existingTeacher) {
        await db
          .insert(teachers)
          .values({
            id: application.userId,
            bio: null,
            instagramUrl: null,
            revenueShare: 70, // Default 70% revenue share
          });
        console.log('Teacher profile created');
      }
    } else if (status === 'rejected') {
      console.log('Processing rejection - updating user status');
      // Update user's teacher application status
      await db
        .update(users)
        .set({ teacherApplicationStatus: 'rejected' })
        .where(eq(users.id, application.userId));
      console.log('User status updated to rejected');
    }

    // Send email notification
    if (process.env.RESEND_API_KEY && application.user) {
      try {
        console.log('Sending email notification');
        const { sendTeacherApplicationStatusUpdate } = await import('@/lib/email/resend');
        await sendTeacherApplicationStatusUpdate(
          application.user.email || '',
          application.user.name || 'Unknown',
          status,
          reviewNotes
        );
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    console.log('Request completed successfully');
    return NextResponse.json({ 
      application: updatedApplication,
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating teacher application:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
} 