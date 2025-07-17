import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teacherApplications, users } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET - List all teacher applications (admin only)
export async function GET() {
  try {
    const user = await getUser();
    if (!user || !['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Get all applications with user details
    const applications = await db
      .select({
        id: teacherApplications.id,
        userId: teacherApplications.userId,
        experienceLevel: teacherApplications.experienceLevel,
        trainingBackground: teacherApplications.trainingBackground,
        offlinePractice: teacherApplications.offlinePractice,
        regularStudentsCount: teacherApplications.regularStudentsCount,
        revenueModel: teacherApplications.revenueModel,
        motivation: teacherApplications.motivation,
        additionalInfo: teacherApplications.additionalInfo,
        status: teacherApplications.status,
        submittedAt: teacherApplications.submittedAt,
        reviewedAt: teacherApplications.reviewedAt,
        reviewNotes: teacherApplications.reviewNotes,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(teacherApplications)
      .leftJoin(users, eq(teacherApplications.userId, users.id))
      .orderBy(desc(teacherApplications.submittedAt));

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching teacher applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
} 