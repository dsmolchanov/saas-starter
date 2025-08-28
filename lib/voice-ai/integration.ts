import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AccessToken } from 'livekit-server-sdk';

// Configuration for both Supabase instances
const YOGA_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const YOGA_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const VOICE_SUPABASE_URL = process.env.VOICE_SUPABASE_URL!;
const VOICE_SUPABASE_SERVICE_KEY = process.env.VOICE_SUPABASE_SERVICE_KEY!;

// LiveKit Voice Agent API
const VOICE_AGENT_API = process.env.VOICE_AGENT_API_URL || 'https://livekit-voice-worker.fly.dev';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://your-livekit-server.livekit.cloud';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create client for Voice platform's Supabase
const voiceSupabase = createSupabaseClient(
  VOICE_SUPABASE_URL,
  VOICE_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface YogaVoiceSessionConfig {
  classId: string;
  teacherId: string;
  studentId: string;
  studentEmail: string;
  classType: 'live' | 'recorded' | 'ai-only';
  classData: {
    title: string;
    style: string;
    level: string;
    duration: number;
    sequence?: any[];
  };
  teacherData: {
    name: string;
    teaching_style?: string;
    voice_clone_id?: string;
    voice_settings?: any;
  };
  practiceSettings?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    modifications?: string[];
    preferences?: any;
  };
}

/**
 * Synchronizes yoga class data with voice platform and creates agent config
 */
export async function syncYogaAgentConfig(config: YogaVoiceSessionConfig) {
  const { teacherId, teacherData, classData, practiceSettings } = config;
  
  // Create unique agent ID for this yoga instructor
  const agentId = `yoga_instructor_${teacherId}_v1`;
  
  // Build agent configuration for voice platform
  const agentConfig = {
    agent_id: agentId,
    name: `${teacherData.name} - Yoga Instructor`,
    system_prompt: buildYogaSystemPrompt(teacherData, classData, practiceSettings),
    llm: {
      model: 'gpt-4o',
      temperature: 0.7
    },
    tts: {
      provider: teacherData.voice_clone_id ? 'elevenlabs' : 'openai',
      voice: teacherData.voice_clone_id || 'alloy',
      style: teacherData.teaching_style || 'calm',
      speed: 1.0
    },
    stt: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en'
    },
    tools: [
      'pose_guidance',
      'breathing_cue',
      'modification_suggestion',
      'safety_check',
      'encouragement',
      'transition_guide'
    ],
    context: {
      platform: 'dzen-yoga',
      teacher_id: teacherId,
      class_style: classData.style,
      class_level: classData.level,
      sequence: classData.sequence,
      student_modifications: practiceSettings?.modifications || [],
      safety_rules: generateYogaSafetyRules(practiceSettings?.modifications)
    }
  };

  // Store agent config in Voice platform's Supabase
  const { data, error } = await voiceSupabase
    .from('agent_configs')
    .upsert({
      agent_id: agentId,
      config: agentConfig,
      platform: 'dzen-yoga',
      created_at: new Date().toISOString()
    }, {
      onConflict: 'agent_id'
    });

  if (error) {
    console.error('Error syncing agent config to voice platform:', error);
    throw new Error('Failed to sync agent configuration');
  }

  return { agentId, agentConfig };
}

/**
 * Creates a voice session by coordinating between both platforms
 */
export async function createVoiceSession(config: YogaVoiceSessionConfig) {
  // 1. Sync agent configuration to voice platform
  const { agentId } = await syncYogaAgentConfig(config);
  
  // 2. Generate room name
  const roomName = `yoga-${config.classId}-${Date.now()}`;
  
  // 3. Create LiveKit access token for student
  const userToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: config.studentId,
    name: config.studentEmail,
    metadata: JSON.stringify({
      role: 'student',
      platform: 'dzen-yoga',
      classId: config.classId,
      teacherId: config.teacherId
    })
  });

  userToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  });

  // 4. Dispatch to voice agent with proper metadata
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Only add Authorization header if API key is configured
  if (process.env.VOICE_AGENT_API_KEY && process.env.VOICE_AGENT_API_KEY !== 'your-voice-agent-api-key') {
    headers['Authorization'] = `Bearer ${process.env.VOICE_AGENT_API_KEY}`;
  }

  const dispatchResponse = await fetch(`${VOICE_AGENT_API}/join`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      agent_id: agentId,
      room: roomName,
      metadata: {
        platform: 'dzen-yoga',
        classType: config.classType,
        classId: config.classId,
        teacherId: config.teacherId,
        studentId: config.studentId,
        practiceSettings: config.practiceSettings
      }
    })
  });

  if (!dispatchResponse.ok) {
    const error = await dispatchResponse.text();
    throw new Error(`Failed to dispatch voice agent: ${error}`);
  }

  const dispatchData = await dispatchResponse.json();

  // 5. Store session reference in BOTH databases
  
  // Store in yoga platform database
  const yogaSupabase = await createServerSupabaseClient();
  const { data: yogaSession, error: yogaError } = await yogaSupabase
    .from('voice_sessions')
    .insert({
      room_name: roomName,
      class_id: config.classId,
      teacher_id: config.teacherId,
      student_id: config.studentId,
      agent_id: agentId,
      status: 'active',
      started_at: new Date().toISOString(),
      metadata: {
        classType: config.classType,
        practiceSettings: config.practiceSettings,
        voice_platform_ref: dispatchData.session_id // Reference to voice platform
      }
    })
    .select()
    .single();

  if (yogaError) {
    console.error('Error creating yoga session record:', yogaError);
  }

  // Store reference in voice platform database
  const { data: voiceSession, error: voiceError } = await voiceSupabase
    .from('platform_sessions')
    .insert({
      session_id: dispatchData.session_id,
      room_name: roomName,
      agent_id: agentId,
      platform: 'dzen-yoga',
      platform_session_id: yogaSession?.id,
      platform_metadata: {
        class_id: config.classId,
        teacher_id: config.teacherId,
        student_id: config.studentId,
        class_type: config.classType
      },
      created_at: new Date().toISOString()
    });

  if (voiceError) {
    console.error('Error creating voice platform session reference:', voiceError);
  }

  return {
    sessionId: yogaSession?.id,
    voiceSessionId: dispatchData.session_id,
    room: roomName,
    token: await userToken.toJwt(),
    livekitUrl: LIVEKIT_URL,
    agentId: agentId
  };
}

/**
 * Ends a voice session and syncs status between platforms
 */
export async function endVoiceSession(sessionId: string, studentId: string) {
  const yogaSupabase = await createServerSupabaseClient();
  
  // 1. Get session details from yoga platform
  const { data: session, error: fetchError } = await yogaSupabase
    .from('voice_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('student_id', studentId)
    .single();

  if (fetchError || !session) {
    throw new Error('Session not found');
  }

  // 2. Update yoga platform session
  const { error: yogaError } = await yogaSupabase
    .from('voice_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (yogaError) {
    console.error('Error updating yoga session:', yogaError);
  }

  // 3. Update voice platform session if reference exists
  if (session.metadata?.voice_platform_ref) {
    const { error: voiceError } = await voiceSupabase
      .from('platform_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('session_id', session.metadata.voice_platform_ref);

    if (voiceError) {
      console.error('Error updating voice platform session:', voiceError);
    }
  }

  return { success: true };
}

/**
 * Fetches session analytics from voice platform
 */
export async function getSessionAnalytics(sessionId: string) {
  const yogaSupabase = await createServerSupabaseClient();
  
  // Get session from yoga platform
  const { data: session } = await yogaSupabase
    .from('voice_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session?.metadata?.voice_platform_ref) {
    return null;
  }

  // Fetch analytics from voice platform
  const { data: analytics } = await voiceSupabase
    .from('usage_metrics')
    .select('*')
    .eq('session_id', session.metadata.voice_platform_ref);

  return analytics;
}

// Helper function to build yoga-specific system prompt
function buildYogaSystemPrompt(
  teacher: any,
  classData: any,
  practiceSettings: any
): string {
  return `You are ${teacher.name}, a professional yoga instructor guiding a ${classData.style} class.

Class: ${classData.title}
Level: ${classData.level}
Duration: ${classData.duration} minutes
Teaching Style: ${teacher.teaching_style || 'encouraging and mindful'}

Core Responsibilities:
1. Guide students through yoga poses with clear, anatomical cues
2. Remind students to breathe deeply and coordinate movement with breath
3. Offer modifications for different skill levels and limitations
4. Ensure safety by watching for signs of strain or discomfort
5. Create a calming, focused atmosphere
6. Respond to student questions and concerns during practice

Interaction Guidelines:
- Use warm, encouraging tone
- Provide specific alignment cues (e.g., "Draw your shoulder blades down your back")
- Cue breathing (e.g., "Inhale to lengthen, exhale to deepen")
- Offer options (e.g., "You can stay here or if you'd like more challenge...")
- Check in periodically ("How does that feel?")
- Guide smooth transitions between poses
- Use positive reinforcement

${practiceSettings?.modifications?.length ? `
Student Considerations:
${practiceSettings.modifications.map((mod: string) => `- ${mod}`).join('\n')}

Provide appropriate modifications and avoid contraindicated poses.
` : ''}

Safety Priority:
- Never push students beyond their comfort
- Encourage students to listen to their bodies
- Suggest rest when needed
- Provide alternatives for challenging poses

Remember: You're creating a supportive, inclusive environment where students feel safe to explore their practice at their own pace.`;
}

// Generate safety rules based on modifications
function generateYogaSafetyRules(modifications?: string[]): string[] {
  const baseRules = [
    'Honor your body\'s limits',
    'Stop if you feel pain',
    'Maintain steady breathing',
    'Use props as needed',
    'Take child\'s pose anytime'
  ];

  if (!modifications?.length) return baseRules;

  const modRules: Record<string, string[]> = {
    pregnancy: [
      'Avoid deep twists and prone positions',
      'Widen stance for balance',
      'No breath retention',
      'Keep intensity moderate'
    ],
    back_injury: [
      'Keep spine neutral in folds',
      'Bend knees generously',
      'Avoid deep backbends',
      'Use blocks for support'
    ],
    knee_injury: [
      'Use blanket under knees',
      'Avoid deep knee flexion',
      'Step instead of jumping',
      'Modify or skip kneeling poses'
    ],
    shoulder_injury: [
      'Keep arms below shoulder height',
      'Avoid weight bearing on hands',
      'Use straps for binds',
      'Skip arm balances'
    ],
    high_blood_pressure: [
      'Avoid inversions',
      'No long holds',
      'Keep head above heart',
      'Focus on gentle practice'
    ]
  };

  const additionalRules = modifications
    .flatMap(mod => modRules[mod] || [])
    .filter((rule, index, self) => self.indexOf(rule) === index);

  return [...baseRules, ...additionalRules];
}