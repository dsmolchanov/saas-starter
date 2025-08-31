import { createClient } from '@/lib/supabase/client';

interface TranslationResult {
  success: boolean;
  message: string;
  translations_count?: number;
  source_locale?: string;
  target_locales?: string[];
}

/**
 * Triggers auto-translation for a specific entity
 * The source language will be automatically detected based on existing translations
 */
export async function triggerAutoTranslation(
  entityType: string,
  entityId: string,
  options?: {
    sourceLocale?: string;
    targetLocales?: string[];
  }
): Promise<TranslationResult> {
  try {
    const supabase = createClient();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('auto-translate', {
      body: {
        entity_type: entityType,
        entity_id: entityId,
        source_locale: options?.sourceLocale,
        target_locales: options?.targetLocales,
      },
    });

    if (error) {
      console.error('Error calling auto-translate function:', error);
      return {
        success: false,
        message: error.message || 'Failed to trigger auto-translation',
      };
    }

    return data as TranslationResult;
  } catch (error) {
    console.error('Error in triggerAutoTranslation:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

/**
 * Queue multiple entities for translation
 */
export async function queueEntitiesForTranslation(
  entities: Array<{ type: string; id: string }>
): Promise<{ queued: number; failed: number }> {
  const supabase = createClient();
  let queued = 0;
  let failed = 0;

  for (const entity of entities) {
    const { error } = await supabase.rpc('queue_entity_for_translation', {
      p_entity_type: entity.type,
      p_entity_id: entity.id,
    });

    if (error) {
      console.error(`Failed to queue ${entity.type}:${entity.id}:`, error);
      failed++;
    } else {
      queued++;
    }
  }

  return { queued, failed };
}

/**
 * Get entities that need translation
 */
export async function getEntitiesNeedingTranslation(limit = 10) {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_entities_needing_translation', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching entities needing translation:', error);
    return [];
  }

  return data || [];
}

/**
 * Process the translation queue (typically called by a cron job or admin action)
 */
export async function processTranslationQueue() {
  const supabase = createClient();
  
  // Get items from queue
  const { data: queueItems, error: queueError } = await supabase.rpc('process_translation_queue');
  
  if (queueError) {
    console.error('Error processing translation queue:', queueError);
    return { processed: 0, failed: 0 };
  }

  if (!queueItems || queueItems.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  // Process each queued item
  for (const item of queueItems) {
    const result = await triggerAutoTranslation(item.entity_type, item.entity_id);
    
    // Mark as completed or failed
    const { error: updateError } = await supabase.rpc('mark_translation_completed', {
      p_entity_type: item.entity_type,
      p_entity_id: item.entity_id,
      p_success: result.success,
      p_error_message: result.success ? null : result.message,
    });

    if (updateError) {
      console.error('Error updating queue status:', updateError);
    }

    if (result.success) {
      processed++;
    } else {
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Get translation queue status
 */
export async function getTranslationQueueStatus() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('v_translation_queue_status')
    .select('*');

  if (error) {
    console.error('Error fetching queue status:', error);
    return null;
  }

  return data;
}