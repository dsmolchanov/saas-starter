import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teachers, courses, lessons, focusAreas, users } from '@/lib/db/schema';
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

    // Fetch lessons with focus areas
    const lessonsData = await db.query.lessons.findMany({
      with: {
        focusAreas: {
          with: {
            focusArea: true,
          },
        },
      },
      limit: 50,
    });

    // Fetch courses with teacher (user) info and lesson count
    const coursesData = await db.query.courses.findMany({
      with: {
        teacher: {
          columns: {
            id: true,
            name: true,
          },
        },
        lessons: {
          columns: { id: true },
        },
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

    return NextResponse.json({
      teachers: teachersData,
      lessons: lessonsData,
      courses: coursesData,
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