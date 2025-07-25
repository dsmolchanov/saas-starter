import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { classes, courses } from '@/lib/db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';

// GET - Fetch available classes for course assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { courseId } = await params;

    // Verify teacher owns the course
    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.teacherId, user.id)),
    });

    if (!course) {
      return NextResponse.json({ 
        error: 'Course not found or you do not have permission' 
      }, { status: 403 });
    }

    // Get all teacher's classes that are either unassigned or assigned to this course
    const teacherClasses = await db.query.classes.findMany({
      where: and(
        eq(classes.teacherId, user.id),
        or(
          isNull(classes.courseId),
          eq(classes.courseId, courseId)
        )
      ),
      orderBy: (classes, { asc, desc }) => [
        asc(classes.orderIndex),
        desc(classes.createdAt)
      ],
    });

    // Separate assigned and available classes
    const assignedClasses = teacherClasses.filter(c => c.courseId === courseId);
    const availableClasses = teacherClasses.filter(c => !c.courseId);

    return NextResponse.json({ 
      assignedClasses,
      availableClasses 
    });
  } catch (error) {
    console.error('Error fetching course classes:', error);
    return NextResponse.json({ error: 'Failed to fetch course classes' }, { status: 500 });
  }
}

// PUT - Update class assignments for course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { courseId } = await params;
    const body = await request.json();
    const { assignedClassIds, removedClassIds } = body;

    // Verify teacher owns the course
    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.teacherId, user.id)),
    });

    if (!course) {
      return NextResponse.json({ 
        error: 'Course not found or you do not have permission' 
      }, { status: 403 });
    }

    // Process assignments and removals
    const updates = [];

    // Assign classes to course
    if (assignedClassIds && assignedClassIds.length > 0) {
      for (let i = 0; i < assignedClassIds.length; i++) {
        const classId = assignedClassIds[i];
        
        // Verify teacher owns the class
        const classItem = await db.query.classes.findFirst({
          where: and(eq(classes.id, classId), eq(classes.teacherId, user.id)),
        });

        if (classItem) {
          updates.push(
            db.update(classes)
              .set({ 
                courseId,
                orderIndex: i + 1 
              })
              .where(eq(classes.id, classId))
          );
        }
      }
    }

    // Remove classes from course
    if (removedClassIds && removedClassIds.length > 0) {
      for (const classId of removedClassIds) {
        // Verify teacher owns the class
        const classItem = await db.query.classes.findFirst({
          where: and(eq(classes.id, classId), eq(classes.teacherId, user.id)),
        });

        if (classItem) {
          updates.push(
            db.update(classes)
              .set({ 
                courseId: null,
                orderIndex: null 
              })
              .where(eq(classes.id, classId))
          );
        }
      }
    }

    // Execute all updates
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course classes:', error);
    return NextResponse.json({ error: 'Failed to update course classes' }, { status: 500 });
  }
} 