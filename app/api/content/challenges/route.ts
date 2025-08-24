import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems, challenges, challengeDays } from '@/lib/db/schema-content';
import { users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const duration = searchParams.get('duration');
    const teacherId = searchParams.get('teacherId');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    // Build query
    let query = db
      .select({
        challenge: challenges,
        content: contentItems,
      })
      .from(challenges)
      .innerJoin(contentItems, eq(challenges.contentItemId, contentItems.id));
    
    // Apply filters
    const conditions = [];
    
    if (teacherId) {
      conditions.push(eq(contentItems.teacherId, teacherId));
    }
    
    if (duration) {
      const durationDays = parseInt(duration);
      if (!isNaN(durationDays)) {
        conditions.push(eq(challenges.durationDays, durationDays));
      }
    }
    
    // Only show published challenges
    conditions.push(eq(contentItems.status, 'published'));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(contentItems.createdAt));
    
    // Optionally include challenge days
    let challengesWithDays = results;
    if (includeDetails) {
      challengesWithDays = await Promise.all(
        results.map(async (r) => {
          const days = await db
            .select()
            .from(challengeDays)
            .where(eq(challengeDays.challengeId, r.challenge.id))
            .orderBy(challengeDays.dayNumber);
          
          return {
            ...r.challenge,
            ...r.content,
            id: r.challenge.id,
            days,
          };
        })
      );
    } else {
      challengesWithDays = results.map(r => ({
        ...r.challenge,
        ...r.content,
        id: r.challenge.id,
      }));
    }
    
    return NextResponse.json({ 
      challenges: challengesWithDays,
      total: results.length 
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
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
      return NextResponse.json({ error: 'Only teachers can create challenges' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      title,
      description,
      durationDays,
      challengeType,
      difficultyProgression,
      restDays,
      difficulty,
      tags,
      thumbnailUrl,
      days, // Array of day configurations
    } = body;
    
    // Validate required fields
    if (!title || !durationDays) {
      return NextResponse.json({ 
        error: 'Title and duration are required' 
      }, { status: 400 });
    }
    
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create content item first
      const [contentItem] = await tx
        .insert(contentItems)
        .values({
          teacherId: user.id,
          contentType: 'challenge',
          title,
          description,
          status: 'draft',
          visibility: 'public',
          difficulty,
          tags,
          thumbnailUrl,
        })
        .returning();
      
      // Create challenge
      const [challenge] = await tx
        .insert(challenges)
        .values({
          contentItemId: contentItem.id,
          teacherId: user.id,
          durationDays,
          challengeType: challengeType || 'progressive',
          difficultyProgression: difficultyProgression || 'steady',
          restDays: restDays || [],
        })
        .returning();
      
      // Create challenge days if provided
      let createdDays = [];
      if (days && days.length > 0) {
        createdDays = await tx
          .insert(challengeDays)
          .values(
            days.map((day: any, index: number) => ({
              challengeId: challenge.id,
              dayNumber: day.dayNumber || index + 1,
              title: day.title,
              description: day.description,
              contentType: day.contentType,
              contentId: day.contentId,
              isRestDay: day.isRestDay || false,
              isOptional: day.isOptional || false,
              dailyTip: day.dailyTip,
              motivationQuote: day.motivationQuote,
              sortOrder: day.sortOrder || index,
            }))
          )
          .returning();
      }
      
      return { contentItem, challenge, days: createdDays };
    });
    
    return NextResponse.json({ 
      success: true,
      challenge: { 
        ...result.challenge, 
        ...result.contentItem,
        days: result.days 
      }
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}