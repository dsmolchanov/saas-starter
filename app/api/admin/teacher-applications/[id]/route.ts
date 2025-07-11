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
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { status, reviewNotes } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be "approved" or "rejected"' }, { status: 400 });
    }

    // Await params before using them
    const { id } = await params;

    // Get the application to get user details
    const application = await db.query.teacherApplications.findFirst({
      where: eq(teacherApplications.id, id),
      with: {
        user: true
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

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

    // If approved, update user status and create teacher profile
    if (status === 'approved') {
      // Update user's teacher application status
      await db
        .update(users)
        .set({ 
          teacherApplicationStatus: 'approved',
          role: 'teacher' // Update role to teacher
        })
        .where(eq(users.id, application.userId));

      // Create teacher profile if it doesn't exist
      const existingTeacher = await db.query.teachers.findFirst({
        where: eq(teachers.id, application.userId)
      });

      if (!existingTeacher) {
        await db
          .insert(teachers)
          .values({
            id: application.userId,
            bio: null,
            instagramUrl: null,
            revenueShare: 70, // Default 70% revenue share
          });
      }
    } else if (status === 'rejected') {
      // Update user's teacher application status
      await db
        .update(users)
        .set({ teacherApplicationStatus: 'rejected' })
        .where(eq(users.id, application.userId));
    }

    // Send email notification
    if (process.env.RESEND_API_KEY && application.user) {
      try {
        const { sendTeacherApplicationStatusUpdate } = await import('@/lib/email/resend');
        await sendTeacherApplicationStatusUpdate(
          application.user.email || '',
          application.user.name || 'Unknown',
          status,
          reviewNotes
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ 
      application: updatedApplication,
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating teacher application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
} 