import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teachers, courses, classes, focusAreas, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch teachers with user info
    const teachersData = await db.query.teachers.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      limit: 20,
    });

    // Fetch classes (lessons) with focus areas, including all image fields
    const lessonsData = await db.query.classes.findMany({
      with: {
        focusAreas: {
          with: {
            focusArea: true,
          },
        },
      },
      columns: {
        id: true,
        title: true,
        description: true,
        durationMin: true,
        thumbnailUrl: true,
        imageUrl: true,
        difficulty: true,
        intensity: true,
        style: true,
        equipment: true,
      },
      limit: 50,
    });

    // Fetch courses with teacher (user) info and class count
    const coursesData = await db.query.courses.findMany({
      with: {
        teacher: {
          columns: {
            id: true,
            name: true,
          },
        },
        classes: {
          columns: { id: true },
        },
      },
      columns: {
        id: true,
        title: true,
        description: true,
        level: true,
        coverUrl: true,
        imageUrl: true,
        isPublished: true,
      },
      limit: 30,
    });

    // Fetch all focus areas for filters
    const allFocusAreas = await db.query.focusAreas.findMany({
      columns: {
        id: true,
        name: true,
      },
    });

    // Get unique difficulties and styles from lessons
    const allDifficulties = [...new Set(
      lessonsData
        .map(lesson => lesson.difficulty)
        .filter(Boolean)
    )];

    const allStyles = [...new Set(
      lessonsData
        .map(lesson => lesson.style)
        .filter(Boolean)
    )];

    // Map classes to lessons for frontend compatibility
    const coursesWithLessons = coursesData.map(course => ({
      ...course,
      lessons: course.classes || [],
      classes: undefined, // Remove classes field to avoid confusion
    }));

    return NextResponse.json({
      teachers: teachersData,
      lessons: lessonsData,
      courses: coursesWithLessons,
      focusAreas: allFocusAreas,
      difficulties: allDifficulties,
      styles: allStyles,
    });
  } catch (error) {
    console.error('Error fetching browse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch browse data' },
      { status: 500 }
    );
  }
} 