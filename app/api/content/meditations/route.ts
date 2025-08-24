import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { contentItems } from '@/lib/db/schema-content';
import { meditationSessions, users } from '@/lib/db/schema';
import { eq, and, desc, or, ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const focus = searchParams.get('focus');
    const duration = searchParams.get('duration');
    const teacherId = searchParams.get('teacherId');
    
    // Build query
    let query = db
      .select()
      .from(meditationSessions);
    
    // Apply filters
    const conditions = [];
    
    if (teacherId) {
      conditions.push(eq(meditationSessions.teacherId, teacherId));
    }
    
    if (focus) {
      conditions.push(eq(meditationSessions.focus, focus));
    }
    
    if (duration) {
      const durationMin = parseInt(duration);
      if (!isNaN(durationMin)) {
        conditions.push(eq(meditationSessions.durationMin, durationMin));
      }
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(meditationSessions.createdAt));
    
    return NextResponse.json({ 
      meditations: results,
      total: results.length 
    });
  } catch (error) {
    console.error('Error fetching meditations:', error);
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
      return NextResponse.json({ error: 'Only teachers can create meditations' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      title,
      description,
      type,
      focus,
      audioUrl,
      thumbnailUrl,
      durationMin,
    } = body;
    
    // Validate required fields
    if (!title || !audioUrl || !durationMin) {
      return NextResponse.json({ 
        error: 'Title, audio URL, and duration are required' 
      }, { status: 400 });
    }
    
    // Create meditation using existing schema
    const [meditation] = await db
      .insert(meditationSessions)
      .values({
        teacherId: user.id,
        title,
        description,
        type,
        focus,
        audioUrl,
        thumbnailUrl,
        durationMin,
      })
      .returning();
    
    return NextResponse.json({ 
      success: true,
      meditation
    });
  } catch (error) {
    console.error('Error creating meditation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}