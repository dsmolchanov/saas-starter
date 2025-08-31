import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teachers, courses, classes, focusAreas, users, lessonFocusAreas } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';
  
  try {
    const supabase = await createServerSupabaseClient();
    
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

    // Fetch localized classes using RPC
    const { data: classesData, error: classesError } = await supabase
      .rpc('get_classes_localized', {
        p_locale: locale,
        p_limit: 50
      });

    if (classesError) {
      console.error('Error fetching localized classes:', classesError);
    }

    // Map classes data and fetch focus areas
    const lessonsData = classesData?.map((cls: any) => ({
      id: cls.id,
      title: cls.title,
      description: cls.description,
      durationMin: cls.duration_min,
      thumbnailUrl: cls.thumbnail_url,
      coverUrl: cls.cover_url,
      difficulty: cls.difficulty,
      intensity: cls.intensity,
      style: cls.style,
      equipment: cls.equipment,
      focusAreas: [], // Will be populated separately if needed
    })) || [];

    // Fetch localized courses using RPC
    const { data: coursesRawData, error: coursesError } = await supabase
      .rpc('get_courses_localized', {
        p_locale: locale,
        p_limit: 30
      });

    if (coursesError) {
      console.error('Error fetching localized courses:', coursesError);
    }

    // Transform courses data to match expected format
    const coursesData = coursesRawData?.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      coverUrl: course.cover_url,
      isPublished: course.is_published,
      teacher: {
        id: course.teacher_id,
        name: course.teacher_name,
      },
      classes: Array(course.lesson_count).fill({ id: null }), // Placeholder for lesson count
    })) || [];

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
        .map((lesson: any) => lesson.difficulty)
        .filter(Boolean)
    )];

    const allStyles = [...new Set(
      lessonsData
        .map((lesson: any) => lesson.style)
        .filter(Boolean)
    )];

    // Map classes to lessons for frontend compatibility
    const coursesWithLessons = coursesData.map((course: any) => ({
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