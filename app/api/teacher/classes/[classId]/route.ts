import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { classes, lessonFocusAreas, focusAreas, courses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getMuxService } from '@/lib/mux-service';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getErrorTranslations } from '@/lib/translations';

// Helper to get locale from request headers
function getLocaleFromRequest(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.includes('es')) return 'es-MX';
  if (acceptLanguage.includes('en')) return 'en';
  return 'ru'; // default
}

// GET - Fetch specific class for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.unauthenticated }, { status: 401 });
    }

    const { classId } = await params;

    const classItem = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.teacherId, user.id)),
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
    });

    if (!classItem) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.classNotFound }, { status: 404 });
    }

    return NextResponse.json({ class: classItem });
  } catch (error) {
    console.error('Error fetching class:', error);
    const locale = getLocaleFromRequest(request);
    const t = getErrorTranslations(locale);
    return NextResponse.json({ error: t.failedToFetchClasses }, { status: 500 });
  }
}

// PUT - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.unauthenticated }, { status: 401 });
    }

    const { classId } = await params;
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

    // Verify ownership and class exists
    const existingClass = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.teacherId, user.id)),
    });

    if (!existingClass) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.classNotFound }, { status: 404 });
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
          error: t.invalidCourseAssignment 
        }, { status: 400 });
      }
    }

    // Update class
    const [updatedClass] = await db
      .update(classes)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        durationMin: parseInt(durationMin),
        courseId: courseId || null,
        videoPath: videoPath?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        videoType: videoType?.trim() || null,
        muxAssetId: muxAssetId?.trim() || null,
        muxPlaybackId: muxPlaybackId?.trim() || null,
        muxUploadId: muxUploadId?.trim() || null,
        muxStatus: muxStatus?.trim() || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        difficulty: difficulty?.trim() || null,
        intensity: intensity?.trim() || null,
        style: style?.trim() || null,
        equipment: equipment?.trim() || null,
        orderIndex: orderIndex ? parseInt(orderIndex) : null,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, classId))
      .returning();

    // Update focus area associations
    // First, delete existing associations
    await db.delete(lessonFocusAreas).where(eq(lessonFocusAreas.classId, classId));

    // Then, add new associations
    if (focusAreaIds.length > 0) {
      await db.insert(lessonFocusAreas).values(
        focusAreaIds.map((focusAreaId: string) => ({ 
          classId: classId, 
          focusAreaId: focusAreaId 
        }))
      );
    }

    return NextResponse.json({ class: updatedClass });
  } catch (error) {
    console.error('Error updating class:', error);
    const locale = getLocaleFromRequest(request);
    const t = getErrorTranslations(locale);
    return NextResponse.json({ error: t.failedToUpdateClass }, { status: 500 });
  }
}

// DELETE - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.unauthenticated }, { status: 401 });
    }

    const { classId } = await params;

    // Verify ownership and class exists
    const existingClass = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.teacherId, user.id)),
    });

    if (!existingClass) {
      const locale = getLocaleFromRequest(request);
      const t = getErrorTranslations(locale);
      return NextResponse.json({ error: t.classNotFound }, { status: 404 });
    }

    // Delete MUX asset if it exists
    if (existingClass.muxAssetId) {
      try {
        console.log('Deleting MUX asset:', existingClass.muxAssetId);
        const muxService = getMuxService();
        await muxService.deleteAsset(existingClass.muxAssetId);
        console.log('MUX asset deleted successfully');
      } catch (error) {
        console.error('Error deleting MUX asset:', error);
        // Continue with class deletion even if MUX deletion fails
      }
    }

    // Delete cover image from Supabase if it exists
    if (existingClass.imageUrl) {
      try {
        // Extract the file path from the URL
        const url = new URL(existingClass.imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf('images');
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          console.log('Deleting cover image:', filePath);
          
          const supabase = await createServerSupabaseClient();
          const { error } = await supabase.storage
            .from('images')
            .remove([filePath]);
          
          if (error) {
            console.error('Error deleting cover image:', error);
          } else {
            console.log('Cover image deleted successfully');
          }
        }
      } catch (error) {
        console.error('Error deleting cover image:', error);
        // Continue with class deletion even if image deletion fails
      }
    }

    // Delete focus area associations first
    await db.delete(lessonFocusAreas).where(eq(lessonFocusAreas.classId, classId));

    // Delete the class
    await db.delete(classes).where(eq(classes.id, classId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    const locale = getLocaleFromRequest(request);
    const t = getErrorTranslations(locale);
    return NextResponse.json({ error: t.failedToDeleteClass }, { status: 500 });
  }
} 