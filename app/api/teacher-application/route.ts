import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teacherApplications, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Check application status for current user
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    // Check if user already has an application
    const application = await db.query.teacherApplications.findFirst({
      where: eq(teacherApplications.userId, user.id),
    });

    return NextResponse.json({ 
      application,
      hasApplication: !!application,
      canApply: !application || application.status === 'rejected'
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json({ error: 'Failed to check application status' }, { status: 500 });
  }
}

// POST - Submit teacher application
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const body = await request.json();
    const {
      experienceLevel,
      trainingBackground,
      offlinePractice,
      regularStudentsCount,
      revenueModel,
      motivation,
      additionalInfo
    } = body;

    // Validate required fields
    if (!experienceLevel || !trainingBackground || !revenueModel) {
      return NextResponse.json({ 
        error: 'Experience level, training background, and revenue model are required' 
      }, { status: 400 });
    }

    // Check if user already has a pending or approved application
    const existingApplication = await db.query.teacherApplications.findFirst({
      where: eq(teacherApplications.userId, user.id),
    });

    if (existingApplication && existingApplication.status !== 'rejected') {
      return NextResponse.json({ 
        error: 'You already have a pending or approved application' 
      }, { status: 400 });
    }

    // Create or update application
    const applicationData = {
      userId: user.id,
      experienceLevel: experienceLevel.trim(),
      trainingBackground: trainingBackground.trim(),
      offlinePractice: offlinePractice?.trim() || null,
      regularStudentsCount: regularStudentsCount?.trim() || null,
      revenueModel: revenueModel.trim(),
      motivation: motivation?.trim() || null,
      additionalInfo: additionalInfo?.trim() || null,
      status: 'pending' as const,
      submittedAt: new Date(),
    };

    let application;
    if (existingApplication) {
      // Update existing rejected application
      [application] = await db
        .update(teacherApplications)
        .set(applicationData)
        .where(eq(teacherApplications.id, existingApplication.id))
        .returning();
    } else {
      // Create new application
      [application] = await db
        .insert(teacherApplications)
        .values(applicationData)
        .returning();
    }

    // Update user's application status
    await db
      .update(users)
      .set({ teacherApplicationStatus: 'pending' })
      .where(eq(users.id, user.id));

    // Send email notifications
    if (process.env.RESEND_API_KEY) {
      try {
        const { sendTeacherApplicationNotification } = await import('@/lib/email/resend');
        await sendTeacherApplicationNotification({
          applicantName: user.name || 'Unknown',
          applicantEmail: user.email || '',
          experienceLevel,
          trainingBackground,
          offlinePractice,
          regularStudentsCount,
          revenueModel,
          motivation,
          additionalInfo,
          submittedAt: new Date()
        });
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // Don't fail the application submission if email fails
      }
    }

    return NextResponse.json({ 
      application,
      success: true,
      message: 'Your teacher application has been submitted successfully!' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting teacher application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
} 