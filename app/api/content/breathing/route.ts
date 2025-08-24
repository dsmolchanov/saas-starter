import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems, breathingExercises } from '@/lib/db/schema-content';
import { users } from '@/lib/db/schema';
import { eq, and, desc, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patternType = searchParams.get('pattern');
    const difficulty = searchParams.get('difficulty');
    const teacherId = searchParams.get('teacherId');
    
    // Build query
    let query = db
      .select({
        exercise: breathingExercises,
        content: contentItems,
      })
      .from(breathingExercises)
      .innerJoin(contentItems, eq(breathingExercises.contentItemId, contentItems.id));
    
    // Apply filters
    const conditions = [];
    
    if (teacherId) {
      conditions.push(eq(contentItems.teacherId, teacherId));
    }
    
    if (patternType) {
      conditions.push(eq(breathingExercises.patternType, patternType));
    }
    
    if (difficulty) {
      conditions.push(eq(contentItems.difficulty, difficulty));
    }
    
    // Only show published content
    conditions.push(eq(contentItems.status, 'published'));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(contentItems.createdAt));
    
    return NextResponse.json({ 
      exercises: results.map(r => ({
        ...r.exercise,
        ...r.content,
        id: r.exercise.id,
      })),
      total: results.length 
    });
  } catch (error) {
    console.error('Error fetching breathing exercises:', error);
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
      return NextResponse.json({ error: 'Only teachers can create breathing exercises' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      title,
      description,
      patternType,
      inhaleCount,
      holdInCount,
      exhaleCount,
      holdOutCount,
      rounds,
      totalDurationMin,
      audioGuidanceUrl,
      visualPatternData,
      instructions,
      benefits,
      contraindications,
      difficulty,
      thumbnailUrl,
    } = body;
    
    // Validate required fields
    if (!title || !patternType) {
      return NextResponse.json({ 
        error: 'Title and pattern type are required' 
      }, { status: 400 });
    }
    
    // Calculate duration if not provided
    const calculatedDuration = totalDurationMin || 
      Math.ceil(((inhaleCount + holdInCount + exhaleCount + holdOutCount) * rounds) / 60);
    
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create content item first
      const [contentItem] = await tx
        .insert(contentItems)
        .values({
          teacherId: user.id,
          contentType: 'breathing',
          title,
          description,
          status: 'draft',
          visibility: 'public',
          difficulty,
          durationMin: calculatedDuration,
          thumbnailUrl,
        })
        .returning();
      
      // Create breathing exercise
      const [exercise] = await tx
        .insert(breathingExercises)
        .values({
          contentItemId: contentItem.id,
          patternType,
          inhaleCount,
          holdInCount,
          exhaleCount,
          holdOutCount,
          rounds,
          roundDurationSeconds: (inhaleCount + holdInCount + exhaleCount + holdOutCount),
          totalDurationMin: calculatedDuration,
          audioGuidanceUrl,
          visualPatternData,
          instructions,
          benefits,
          contraindications,
        })
        .returning();
      
      return { contentItem, exercise };
    });
    
    return NextResponse.json({ 
      success: true,
      exercise: { ...result.exercise, ...result.contentItem }
    });
  } catch (error) {
    console.error('Error creating breathing exercise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}