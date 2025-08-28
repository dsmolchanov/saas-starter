'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Room, 
  RoomEvent, 
  Track, 
  RemoteTrack, 
  RemoteTrackPublication,
  RemoteParticipant,
  Participant,
  ConnectionState 
} from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff,
  Activity,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface VoiceSessionProps {
  classId: string;
  classTitle: string;
  teacherName: string;
  onSessionEnd?: (sessionId: string) => void;
}

interface SessionState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  sessionId: string | null;
  room: Room | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  agentSpeaking: boolean;
  error: string | null;
  metrics: {
    duration: number;
    corrections: number;
    interactions: number;
  };
}

export function VoiceSession({ classId, classTitle, teacherName, onSessionEnd }: VoiceSessionProps) {
  const [state, setState] = useState<SessionState>({
    status: 'idle',
    sessionId: null,
    room: null,
    isMuted: false,
    isSpeakerOn: true,
    agentSpeaking: false,
    error: null,
    metrics: {
      duration: 0,
      corrections: 0,
      interactions: 0
    }
  });

  const [practiceSettings, setPracticeSettings] = useState({
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    duration: 45,
    modifications: [] as string[]
  });

  const roomRef = useRef<Room | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize LiveKit room
  const initializeRoom = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'connecting', error: null }));

    try {
      // Create voice session
      const response = await fetch('/api/voice/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          classType: 'ai-only',
          practiceSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create voice session');
      }

      const { session } = await response.json();
      
      // Create LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up event handlers
      room.on(RoomEvent.Connected, () => {
        console.log('Connected to voice session');
        setState(prev => ({ ...prev, status: 'connected' }));
        startTimeRef.current = new Date();
        startMetricsTracking();
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from voice session');
        setState(prev => ({ ...prev, status: 'disconnected' }));
        stopMetricsTracking();
      });

      room.on(RoomEvent.TrackSubscribed, (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind === Track.Kind.Audio) {
          // Attach audio track to play agent's voice
          const audioElement = track.attach();
          document.body.appendChild(audioElement);
          audioElement.play();
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        track.detach();
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        // Check if agent is speaking
        const agentSpeaking = speakers.some(p => p.identity.includes('agent'));
        setState(prev => ({ ...prev, agentSpeaking }));
      });

      room.on(RoomEvent.DataReceived, (data: Uint8Array, participant?: RemoteParticipant) => {
        // Handle data messages from agent (corrections, metrics, etc.)
        try {
          const message = JSON.parse(new TextDecoder().decode(data));
          handleAgentMessage(message);
        } catch (error) {
          console.error('Error parsing agent message:', error);
        }
      });

      // Connect to room
      await room.connect(session.livekitUrl, session.token);

      roomRef.current = room;
      setState(prev => ({ 
        ...prev, 
        room, 
        sessionId: session.sessionId 
      }));

    } catch (error) {
      console.error('Error initializing voice session:', error);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to connect'
      }));
    }
  }, [classId, practiceSettings]);

  // Handle messages from AI agent
  const handleAgentMessage = (message: any) => {
    switch (message.type) {
      case 'correction':
        setState(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            corrections: prev.metrics.corrections + 1
          }
        }));
        break;
      case 'interaction':
        setState(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            interactions: prev.metrics.interactions + 1
          }
        }));
        break;
    }
  };

  // Track session metrics
  const startMetricsTracking = () => {
    metricsIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        setState(prev => ({
          ...prev,
          metrics: { ...prev.metrics, duration }
        }));
      }
    }, 1000);
  };

  const stopMetricsTracking = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  };

  // Start voice session
  const startSession = () => {
    initializeRoom();
  };

  // End voice session
  const endSession = async () => {
    if (state.sessionId) {
      try {
        await fetch(`/api/voice/sessions?sessionId=${state.sessionId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    stopMetricsTracking();
    
    if (state.sessionId && onSessionEnd) {
      onSessionEnd(state.sessionId);
    }

    setState(prev => ({ 
      ...prev, 
      status: 'idle',
      sessionId: null,
      room: null
    }));
  };

  // Toggle microphone
  const toggleMute = async () => {
    if (state.room) {
      const localParticipant = state.room.localParticipant;
      await localParticipant.setMicrophoneEnabled(state.isMuted);
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    setState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    // In a real implementation, you'd control audio output here
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      stopMetricsTracking();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Session Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{classTitle}</h3>
            <p className="text-sm text-muted-foreground">with AI {teacherName}</p>
          </div>
          <div className="flex items-center gap-2">
            {state.agentSpeaking && (
              <div className="flex items-center gap-1 text-green-600">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">AI Speaking</span>
              </div>
            )}
            {state.status === 'connected' && (
              <div className="text-sm font-medium">
                {formatDuration(state.metrics.duration)}
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {state.error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Session Controls */}
        <div className="flex items-center justify-center gap-4">
          {state.status === 'idle' && (
            <Button 
              size="lg" 
              onClick={startSession}
              className="gap-2"
            >
              <Phone className="w-5 h-5" />
              Start Voice Session
            </Button>
          )}

          {state.status === 'connecting' && (
            <Button size="lg" disabled>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </Button>
          )}

          {state.status === 'connected' && (
            <>
              <Button
                size="icon"
                variant={state.isMuted ? "destructive" : "secondary"}
                onClick={toggleMute}
                title={state.isMuted ? "Unmute" : "Mute"}
              >
                {state.isMuted ? <MicOff /> : <Mic />}
              </Button>

              <Button
                size="icon"
                variant={state.isSpeakerOn ? "secondary" : "destructive"}
                onClick={toggleSpeaker}
                title={state.isSpeakerOn ? "Speaker On" : "Speaker Off"}
              >
                {state.isSpeakerOn ? <Volume2 /> : <VolumeX />}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                onClick={endSession}
                className="gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                End Session
              </Button>
            </>
          )}
        </div>

        {/* Session Metrics */}
        {state.status === 'connected' && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{state.metrics.interactions}</p>
              <p className="text-sm text-muted-foreground">Interactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{state.metrics.corrections}</p>
              <p className="text-sm text-muted-foreground">Corrections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatDuration(state.metrics.duration)}</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
          </div>
        )}
      </Card>

      {/* Voice Guidance Tips */}
      {state.status === 'connected' && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Voice Commands You Can Use:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• "I need a modification" - Get easier variations</li>
            <li>• "This hurts" - Receive safety guidance</li>
            <li>• "How much longer?" - Check remaining time</li>
            <li>• "I can't balance" - Get stability tips</li>
            <li>• "What's next?" - Preview upcoming poses</li>
          </ul>
        </Card>
      )}
    </div>
  );
}