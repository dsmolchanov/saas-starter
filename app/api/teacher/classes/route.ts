import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { classes, lessonFocusAreas, focusAreas, courses } from '@/lib/db/schema';
import { eq, and, SQL } from 'drizzle-orm';
import { getErrorTranslations } from '@/lib/translations';

// Helper to get locale from request headers
function getLocaleFromRequest(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.includes('es')) return 'es-MX';
  if (acceptLanguage.includes('en')) return 'en';
  return 'ru'; // default
}

// GET - Fetch teacher's classes
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.unauthenticated }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    const whereConditions = [eq(classes.teacherId, user.id)];
    if (courseId) {
      whereConditions.push(eq(classes.courseId, courseId));
    }

    const teacherClasses = await db.query.classes.findMany({
      where: whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions),
      with: {
        course: {
          columns: {
            id: true,
            title: true,
          },
        },
        focusAreas: {
          with: {
            focusArea: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: (classes, { desc }) => [desc(classes.createdAt)],
    });

    return NextResponse.json({ classes: teacherClasses });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    const locale = getLocaleFromRequest(request);
    const t = getErrorTranslations(locale);
    return NextResponse.json({ error: t.failedToFetchClasses }, { status: 500 });
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.unauthenticated }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      durationMin, 
      courseId, 
      videoPath, 
      videoUrl,
      videoType,
      muxAssetId,
      muxPlaybackId,
      muxUploadId,
      muxStatus,
      thumbnailUrl, 
      imageUrl,
      coverImage, // Allow both imageUrl and coverImage for flexibility
      difficulty, 
      intensity, 
      style, 
      equipment,
      orderIndex,
      focusAreaIds = [] 
    } = body;

    // Validate required fields
    if (!title) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ 
        error: t.titleRequired 
      }, { status: 400 });
    }

    // If courseId is provided, verify it belongs to the teacher
    if (courseId) {
      const course = await db.query.courses.findFirst({
        where: and(eq(courses.id, courseId), eq(courses.teacherId, user.id)),
      });

      if (!course) {
        const locale = getLocaleFromRequest(request);
        const t = getErrorTranslations(locale);
        return NextResponse.json({ 
          error: t.invalidCourse 
        }, { status: 400 });
      }
    }

    const [newClass] = await db
      .insert(classes)
      .values({
        teacherId: user.id,
        courseId: courseId || null,
        title: title.trim(),
        description: description?.trim() || null,
        durationMin: parseInt(durationMin),
        videoPath: videoPath?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        videoType: videoType?.trim() || null,
        muxAssetId: muxAssetId?.trim() || null,
        muxPlaybackId: muxPlaybackId?.trim() || null,
        muxUploadId: muxUploadId?.trim() || null,
        muxStatus: muxStatus?.trim() || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        coverUrl: (coverImage || imageUrl)?.trim() || null,
        difficulty: difficulty?.trim() || null,
        intensity: intensity?.trim() || null,
        style: style?.trim() || null,
        equipment: equipment?.trim() || null,
        orderIndex: orderIndex ? parseInt(orderIndex) : null,
      })
      .returning();

    // Add focus area associations
    if (focusAreaIds.length > 0) {
      await db.insert(lessonFocusAreas).values(
        focusAreaIds.map((focusAreaId: string) => ({ 
          classId: newClass.id, 
          focusAreaId: focusAreaId 
        }))
      );
    }

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    const locale = getLocaleFromRequest(request);
    const t = getErrorTranslations(locale);
    return NextResponse.json({ error: t.failedToCreateClass }, { status: 500 });
  }
} 