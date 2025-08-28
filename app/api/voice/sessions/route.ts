import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  createVoiceSession, 
  endVoiceSession,
  getSessionAnalytics,
  YogaVoiceSessionConfig 
} from '@/lib/voice-ai/integration';

interface CreateSessionRequest {
  classId: string;
  classType: 'live' | 'recorded' | 'ai-only';
  practiceSettings?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    modifications?: string[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateSessionRequest = await req.json();
    const { classId, classType, practiceSettings } = body;

    // Fetch class details with teacher info
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        courses(*),
        teachers(*)
      `)
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Prepare configuration for voice session
    const sessionConfig: YogaVoiceSessionConfig = {
      classId,
      teacherId: classData.teacher_id,
      studentId: user.id,
      studentEmail: user.email || '',
      classType,
      classData: {
        title: classData.title,
        style: classData.style || 'yoga',
        level: classData.level || 'all levels',
        duration: classData.duration || 45,
        sequence: classData.sequence
      },
      teacherData: {
        name: classData.teachers?.name || 'Instructor',
        teaching_style: classData.teachers?.teaching_style,
        voice_clone_id: classData.teachers?.voice_clone_id,
        voice_settings: classData.teachers?.voice_settings
      },
      practiceSettings
    };

    // Create voice session using integration layer
    const session = await createVoiceSession(sessionConfig);

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error creating voice session:', error);
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    );
  }
}

// End voice session
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // End session using integration layer
    await endVoiceSession(sessionId, user.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error ending voice session:', error);
    return NextResponse.json(
      { error: 'Failed to end voice session' },
      { status: 500 }
    );
  }
}

// Get session analytics
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      // Return list of user's sessions
      const { data: sessions, error } = await supabase
        .from('voice_sessions')
        .select(`
          *,
          classes(title, style),
          teachers(name)
        `)
        .eq('student_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({ sessions });
    }

    // Get specific session with analytics
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select(`
        *,
        classes(title, style),
        teachers(name),
        voice_session_metrics(*)
      `)
      .eq('id', sessionId)
      .eq('student_id', user.id)
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Fetch analytics from voice platform if available
    const voiceAnalytics = await getSessionAnalytics(sessionId);

    return NextResponse.json({
      session,
      voiceAnalytics
    });

  } catch (error) {
    console.error('Error fetching session data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}