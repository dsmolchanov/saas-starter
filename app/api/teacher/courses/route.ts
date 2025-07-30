import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { courses, categories, classes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch teacher's courses
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const teacherCourses = await db.query.courses.findMany({
      where: eq(courses.teacherId, user.id),
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
            durationMin: true,
          },
        },
      },
      orderBy: (courses, { desc }) => [desc(courses.title)],
    });

    return NextResponse.json({ courses: teacherCourses });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST - Create new course
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const body = await request.json();
    const { title, description, level, categoryId, imageUrl, coverUrl } = body;

    // Validate required fields
    if (!title || !categoryId) {
      return NextResponse.json({ 
        error: 'Title and category are required' 
      }, { status: 400 });
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

    // Handle fallback logic for cover image
    let finalCoverUrl = coverUrl?.trim() || null;
    
    // If no cover image provided, get the first class's cover image from this teacher
    if (!finalCoverUrl) {
      const firstClassWithCover = await db.query.classes.findFirst({
        where: eq(classes.teacherId, user.id),
        columns: {
          imageUrl: true,
          thumbnailUrl: true,
        },
        orderBy: (classes, { desc }) => [desc(classes.createdAt)],
      });
      
      // Use cover image or thumbnail from the first available class
      if (firstClassWithCover) {
        finalCoverUrl = firstClassWithCover.imageUrl || firstClassWithCover.thumbnailUrl || null;
      }
    }

    const [newCourse] = await db
      .insert(courses)
      .values({
        teacherId: user.id,
        categoryId,
        title: title.trim(),
        description: description?.trim() || null,
        level: level?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        coverUrl: finalCoverUrl,
        isPublished: 0, // Default to draft
      })
      .returning();

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
} 