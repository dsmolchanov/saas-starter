import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { courses, categories, classes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch specific course for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { courseId } = await params;

    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.teacherId, user.id)),
      with: {
        category: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
        classes: {
          columns: {
            id: true,
            title: true,
            description: true,
            durationMin: true,
            difficulty: true,
            intensity: true,
            orderIndex: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

// PUT - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { courseId } = await params;
    const body = await request.json();
    const { title, description, level, categoryId, imageUrl, coverUrl, isPublished } = body;

    // Validate required fields
    if (!title || !categoryId) {
      return NextResponse.json({ 
        error: 'Title and category are required' 
      }, { status: 400 });
    }

    // Verify ownership and course exists
    const existingCourse = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.teacherId, user.id)),
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Verify category exists
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
    });

    if (!category) {
      return NextResponse.json({ 
        error: 'Invalid category' 
      }, { status: 400 });
    }

    const [updatedCourse] = await db
      .update(courses)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        level: level?.trim() || null,
        categoryId,
        coverUrl: (coverUrl || imageUrl)?.trim() || null,
        isPublished: isPublished ? 1 : 0,
      })
      .where(eq(courses.id, courseId))
      .returning();

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const { courseId } = await params;

    // Verify ownership and course exists
    const existingCourse = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId), eq(courses.teacherId, user.id)),
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course has classes
    const courseClasses = await db.query.classes.findMany({
      where: eq(classes.courseId, courseId),
      columns: { id: true },
    });

    if (courseClasses.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete course with existing classes. Please delete all classes first.' 
      }, { status: 400 });
    }

    await db.delete(courses).where(eq(courses.id, courseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
} 