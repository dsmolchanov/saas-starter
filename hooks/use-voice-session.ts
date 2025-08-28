import { useState, useCallback, useEffect } from 'react';
import { Room } from 'livekit-client';

export interface VoiceSessionConfig {
  classId: string;
  classType: 'live' | 'recorded' | 'ai-only';
  practiceSettings?: {
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    modifications?: string[];
  };
}

export interface VoiceSessionState {
  isActive: boolean;
  isConnecting: boolean;
  sessionId: string | null;
  room: Room | null;
  error: string | null;
  analytics: {
    duration: number;
    interactions: number;
    corrections: number;
    posesCompleted: number;
  };
}

export function useVoiceSession() {
  const [state, setState] = useState<VoiceSessionState>({
    isActive: false,
    isConnecting: false,
    sessionId: null,
    room: null,
    error: null,
    analytics: {
      duration: 0,
      interactions: 0,
      corrections: 0,
      posesCompleted: 0
    }
  });

  // Start a new voice session
  const startSession = useCallback(async (config: VoiceSessionConfig) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const response = await fetch('/api/voice/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start voice session');
      }

      const { session } = await response.json();

      setState(prev => ({
        ...prev,
        isActive: true,
        isConnecting: false,
        sessionId: session.id,
        error: null
      }));

      return session;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      throw error;
    }
  }, []);

  // End the current voice session
  const endSession = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      await fetch(`/api/voice/sessions?sessionId=${state.sessionId}`, {
        method: 'DELETE'
      });

      setState(prev => ({
        ...prev,
        isActive: false,
        sessionId: null,
        room: null,
        analytics: {
          duration: 0,
          interactions: 0,
          corrections: 0,
          posesCompleted: 0
        }
      }));
    } catch (error) {
      console.error('Error ending voice session:', error);
    }
  }, [state.sessionId]);

  // Get session analytics
  const getAnalytics = useCallback(async (sessionId?: string) => {
    const id = sessionId || state.sessionId;
    if (!id) return null;

    try {
      const response = await fetch(`/api/voice/sessions?sessionId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }, [state.sessionId]);

  // Get user's voice session history
  const getSessionHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/voice/sessions');
      if (!response.ok) throw new Error('Failed to fetch session history');

      const { sessions } = await response.json();
      return sessions;
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }, []);

  // Update analytics in real-time
  const updateAnalytics = useCallback((updates: Partial<VoiceSessionState['analytics']>) => {
    setState(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        ...updates
      }
    }));
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (state.isActive) {
        endSession();
      }
    };
  }, []);

  return {
    state,
    startSession,
    endSession,
    getAnalytics,
    getSessionHistory,
    updateAnalytics
  };
}