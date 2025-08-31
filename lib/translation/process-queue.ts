import { createClient } from '@/lib/supabase/client';
import { triggerAutoTranslation } from './auto-translate';

/**
 * Process pending translations from the queue
 * This can be called from a cron job, API route, or admin action
 */
export async function processTranslationQueue(limit = 5) {
  const supabase = createClient();
  
  console.log('Processing translation queue...');
  
  // Get pending items from queue
  const { data: queueItems, error: queueError } = await supabase
    .from('i18n_translation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (queueError) {
    console.error('Error fetching queue:', queueError);
    return { processed: 0, failed: 0, errors: [queueError.message] };
  }
  
  if (!queueItems || queueItems.length === 0) {
    console.log('No pending translations in queue');
    return { processed: 0, failed: 0, errors: [] };
  }
  
  console.log(`Found ${queueItems.length} items to process`);
  
  let processed = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const item of queueItems) {
    try {
      // Update status to processing
      await supabase
        .from('i18n_translation_queue')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', item.id);
      
      // Trigger translation
      console.log(`Translating ${item.entity_type}:${item.entity_id}`);
      const result = await triggerAutoTranslation(
        item.entity_type,
        item.entity_id,
        {
          sourceLocale: item.source_locale || undefined,
          targetLocales: item.target_locales || undefined
        }
      );
      
      if (result.success) {
        // Mark as completed
        await supabase
          .from('i18n_translation_queue')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', item.id);
        
        processed++;
        console.log(`✓ Translated ${result.translations_count} fields`);
      } else {
        // Mark as failed
        await supabase
          .from('i18n_translation_queue')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: result.message
          })
          .eq('id', item.id);
        
        failed++;
        errors.push(`${item.entity_type}:${item.entity_id} - ${result.message}`);
        console.error(`✗ Failed: ${result.message}`);
      }
    } catch (error) {
      // Mark as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await supabase
        .from('i18n_translation_queue')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq('id', item.id);
      
      failed++;
      errors.push(`${item.entity_type}:${item.entity_id} - ${errorMessage}`);
      console.error(`✗ Error: ${errorMessage}`);
    }
  }
  
  console.log(`Queue processing complete: ${processed} processed, ${failed} failed`);
  
  return { processed, failed, errors };
}

/**
 * Get queue status summary
 */
export async function getQueueStatus() {
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

/**
 * Retry failed translations
 */
export async function retryFailedTranslations() {
  const supabase = createClient();
  
  // Reset failed items to pending
  const { data: resetItems, error } = await supabase
    .from('i18n_translation_queue')
    .update({ 
      status: 'pending',
      error_message: null,
      started_at: null,
      completed_at: null
    })
    .eq('status', 'failed')
    .select();
  
  if (error) {
    console.error('Error resetting failed items:', error);
    return { reset: 0, error: error.message };
  }
  
  const resetCount = resetItems?.length || 0;
  console.log(`Reset ${resetCount} failed items to pending`);
  
  // Process them
  const result = await processTranslationQueue();
  
  return {
    reset: resetCount,
    ...result
  };
}