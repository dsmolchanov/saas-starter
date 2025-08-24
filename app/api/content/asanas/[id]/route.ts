import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems, asanas } from '@/lib/db/schema-content';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const result = await db
      .select({
        asana: asanas,
        content: contentItems,
      })
      .from(asanas)
      .innerJoin(contentItems, eq(asanas.contentItemId, contentItems.id))
      .where(eq(asanas.id, id))
      .limit(1);
    
    if (!result[0]) {
      return NextResponse.json({ error: 'Asana not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      asana: {
        ...result[0].asana,
        ...result[0].content,
        id: result[0].asana.id,
      }
    });
  } catch (error) {
    console.error('Error fetching asana:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Check ownership
    const existing = await db
      .select({
        teacherId: contentItems.teacherId,
        contentItemId: asanas.contentItemId,
      })
      .from(asanas)
      .innerJoin(contentItems, eq(asanas.contentItemId, contentItems.id))
      .where(eq(asanas.id, id))
      .limit(1);
    
    if (!existing[0]) {
      return NextResponse.json({ error: 'Asana not found' }, { status: 404 });
    }
    
    if (existing[0].teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update in transaction
    const result = await db.transaction(async (tx) => {
      // Update content item
      if (body.englishName || body.description || body.status || body.difficulty || body.tags) {
        await tx
          .update(contentItems)
          .set({
            title: body.englishName,
            description: body.description,
            status: body.status,
            difficulty: body.difficulty,
            tags: body.tags,
            thumbnailUrl: body.imageUrls?.[0],
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, existing[0].contentItemId));
      }
      
      // Update asana
      const [updatedAsana] = await tx
        .update(asanas)
        .set({
          sanskritName: body.sanskritName,
          englishName: body.englishName,
          category: body.category,
          poseType: body.poseType,
          benefits: body.benefits,
          contraindications: body.contraindications,
          alignmentCues: body.alignmentCues,
          commonMistakes: body.commonMistakes,
          holdDurationSeconds: body.holdDurationSeconds,
          breathPattern: body.breathPattern,
          drishti: body.drishti,
          imageUrls: body.imageUrls,
          videoUrl: body.videoUrl,
          updatedAt: new Date(),
        })
        .where(eq(asanas.id, id))
        .returning();
      
      return updatedAsana;
    });
    
    return NextResponse.json({ success: true, asana: result });
  } catch (error) {
    console.error('Error updating asana:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Check ownership
    const existing = await db
      .select({
        teacherId: contentItems.teacherId,
        contentItemId: asanas.contentItemId,
      })
      .from(asanas)
      .innerJoin(contentItems, eq(asanas.contentItemId, contentItems.id))
      .where(eq(asanas.id, id))
      .limit(1);
    
    if (!existing[0]) {
      return NextResponse.json({ error: 'Asana not found' }, { status: 404 });
    }
    
    if (existing[0].teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete content item (will cascade delete asana)
    await db
      .delete(contentItems)
      .where(eq(contentItems.id, existing[0].contentItemId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asana:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}