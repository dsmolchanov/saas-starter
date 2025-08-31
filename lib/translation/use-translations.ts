'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';

interface TranslationData {
  translation: string;
  locale: string;
  quality_score: number;
  is_auto_translated: boolean;
  needs_review: boolean;
}

interface UseTranslationsOptions {
  entityType: string;
  entityId: string;
  fields: string[];
  locale: string;
  fallbackLocales?: string[];
  trackView?: boolean;
}

export function useTranslations({
  entityType,
  entityId,
  fields,
  locale,
  fallbackLocales = ['en'],
  trackView = true,
}: UseTranslationsOptions) {
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();

  // Fetch translations
  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);
      const translationData: Record<string, TranslationData> = {};

      // Fetch all translations for requested fields
      for (const field of fields) {
        const { data, error } = await supabase.rpc('get_best_translation', {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_field_name: field,
          p_locale: locale,
          p_fallback_locales: fallbackLocales,
        });

        if (error) {
          console.error(`Error fetching translation for ${field}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          translationData[field] = data[0];
        }
      }

      setTranslations(translationData);

      // Track view if enabled
      if (trackView) {
        await supabase.rpc('track_content_view', {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_user_locale: locale,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch translations');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, fields, locale, fallbackLocales, trackView, supabase]);

  // Request translation for missing content
  const requestTranslation = useCallback(async (
    priority: 'urgent' | 'high' | 'normal' | 'low' = 'normal',
    reason?: string
  ) => {
    if (!user) {
      setError('You must be logged in to request translations');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('request_translation', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_user_id: user.id,
        p_user_locale: locale,
        p_priority: priority,
        p_reason: reason,
      });

      if (error) throw error;

      // Trigger on-demand translation for high priority
      if (priority === 'urgent' || priority === 'high') {
        await triggerTranslation();
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request translation');
      return null;
    }
  }, [entityType, entityId, locale, user, supabase]);

  // Trigger immediate translation
  const triggerTranslation = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-translate-v2', {
        body: {
          entity_type: entityType,
          entity_id: entityId,
          target_locales: [locale],
          tier: 'on_demand',
          user_id: user?.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Refresh translations after successful translation
        await fetchTranslations();
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger translation');
      return null;
    }
  }, [entityType, entityId, locale, user, supabase, fetchTranslations]);

  // Vote on translation quality
  const voteTranslation = useCallback(async (
    fieldName: string,
    isHelpful: boolean
  ) => {
    if (!user) {
      setError('You must be logged in to vote');
      return;
    }

    try {
      await supabase.rpc('vote_translation_quality', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_field_name: fieldName,
        p_locale: locale,
        p_is_helpful: isHelpful,
        p_user_id: user.id,
      });

      // Refresh to get updated quality score
      await fetchTranslations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  }, [entityType, entityId, locale, user, supabase, fetchTranslations]);

  // Load translations on mount or when dependencies change
  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  return {
    translations,
    loading,
    error,
    requestTranslation,
    voteTranslation,
    refetch: fetchTranslations,
  };
}

// Hook for teacher to manage translations
export function useTeacherTranslations(teacherId: string) {
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Load teacher settings and stats
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        // Get teacher translation settings
        const { data: settingsData } = await supabase
          .from('teacher_translation_settings')
          .select('*')
          .eq('teacher_id', teacherId)
          .single();

        setSettings(settingsData);

        // Get translation stats for teacher's content
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id')
          .eq('teacher_id', teacherId);

        if (coursesData) {
          const courseIds = coursesData.map(c => c.id);
          
          const { data: metaData } = await supabase
            .from('i18n_content_meta')
            .select('*')
            .eq('entity_type', 'course')
            .in('entity_id', courseIds);

          // Calculate stats
          const totalContent = metaData?.length || 0;
          const translatedContent = metaData?.filter(
            m => m.available_locales.length > 1
          ).length || 0;
          
          const pendingRequests = metaData?.reduce(
            (sum, m) => sum + (m.pending_locales?.length || 0), 
            0
          ) || 0;

          setStats({
            totalContent,
            translatedContent,
            pendingRequests,
            translationCoverage: totalContent > 0 
              ? (translatedContent / totalContent) * 100 
              : 0,
          });
        }
      } catch (error) {
        console.error('Error loading teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [teacherId, supabase]);

  // Update teacher settings
  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    try {
      const { data, error } = await supabase
        .from('teacher_translation_settings')
        .upsert({
          teacher_id: teacherId,
          ...newSettings,
        })
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  };

  // Bulk translate content
  const bulkTranslate = async (
    entityIds: string[],
    entityType: string,
    targetLocales: string[]
  ) => {
    const results = [];

    for (const entityId of entityIds) {
      try {
        const { data } = await supabase.functions.invoke('auto-translate-v2', {
          body: {
            entity_type: entityType,
            entity_id: entityId,
            target_locales: targetLocales,
            tier: 'batch',
          },
        });
        results.push({ entityId, success: data.success });
      } catch (error) {
        results.push({ entityId, success: false, error });
      }
    }

    return results;
  };

  return {
    settings,
    stats,
    loading,
    updateSettings,
    bulkTranslate,
  };
}