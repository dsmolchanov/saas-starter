import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems, asanas } from '@/lib/db/schema-content';
import { eq, and, desc, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const teacherId = searchParams.get('teacherId');
    
    // Build filters
    const conditions = [];
    
    if (teacherId) {
      conditions.push(eq(contentItems.teacherId, teacherId));
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(asanas.category, category));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(asanas.sanskritName, `%${search}%`),
          ilike(asanas.englishName, `%${search}%`),
          ilike(contentItems.description, `%${search}%`)
        )
      );
    }
    
    // Only show published content unless it's the teacher's own
    if (!teacherId || (user && teacherId !== user.id)) {
      conditions.push(eq(contentItems.status, 'published'));
    }
    
    // Build and execute query
    const results = await db
      .select({
        asana: asanas,
        content: contentItems,
      })
      .from(asanas)
      .innerJoin(contentItems, eq(asanas.contentItemId, contentItems.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(contentItems.createdAt));
    
    return NextResponse.json({ 
      asanas: results.map(r => ({
        ...r.asana,
        ...r.content,
        id: r.asana.id,
      })),
      total: results.length 
    });
  } catch (error) {
    console.error('Error fetching asanas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a teacher
    const userRole = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    
    if (!userRole[0] || userRole[0].role !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create asanas' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      sanskritName,
      englishName,
      category,
      poseType,
      description,
      benefits,
      contraindications,
      alignmentCues,
      commonMistakes,
      holdDurationSeconds,
      breathPattern,
      drishti,
      coverUrls,
      videoUrl,
      difficulty,
      tags,
    } = body;
    
    // Validate required fields
    if (!sanskritName || !englishName) {
      return NextResponse.json({ 
        error: 'Sanskrit name and English name are required' 
      }, { status: 400 });
    }
    
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create content item first
      const [contentItem] = await tx
        .insert(contentItems)
        .values({
          teacherId: user.id,
          contentType: 'asana',
          title: englishName,
          description,
          status: 'draft',
          visibility: 'public',
          difficulty,
          tags,
          thumbnailUrl: coverUrls?.[0],
        })
        .returning();
      
      // Create asana
      const [asana] = await tx
        .insert(asanas)
        .values({
          contentItemId: contentItem.id,
          sanskritName,
          englishName,
          category,
          poseType,
          benefits,
          contraindications,
          alignmentCues,
          commonMistakes,
          holdDurationSeconds,
          breathPattern,
          drishti,
          coverUrls,
          videoUrl,
        })
        .returning();
      
      return { contentItem, asana };
    });
    
    return NextResponse.json({ 
      success: true,
      asana: { ...result.asana, ...result.contentItem }
    });
  } catch (error) {
    console.error('Error creating asana:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Import users table
import { users } from '@/lib/db/schema';