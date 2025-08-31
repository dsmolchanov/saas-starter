-- Setup cron jobs for automatic content population and maintenance
-- Requires pg_cron extension to be enabled

-- First, ensure the cron extension is enabled (if not already)
-- Note: This might require superuser privileges
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily spiritual content population at 3 AM UTC
SELECT cron.schedule(
  'populate-spiritual-content-daily',
  '0 3 * * *', -- Daily at 3 AM UTC
  $$SELECT auto_populate_spiritual_content();$$
);

-- Schedule translation queue processing every 6 hours
SELECT cron.schedule(
  'process-translation-queue',
  '0 */6 * * *', -- Every 6 hours
  $$SELECT process_translation_queue('batch', 50);$$
);

-- Schedule high-priority translation processing every hour
SELECT cron.schedule(
  'process-priority-translations',
  '0 * * * *', -- Every hour
  $$SELECT process_translation_queue('immediate', 10);$$
);

-- Schedule cleanup of old translation metadata weekly
SELECT cron.schedule(
  'cleanup-translation-metadata',
  '0 2 * * 0', -- Weekly on Sunday at 2 AM UTC
  $$
  DELETE FROM i18n_translation_queue 
  WHERE status = 'completed' 
  AND completed_at < NOW() - INTERVAL '30 days';
  $$
);

-- Schedule refresh of translation statistics daily
SELECT cron.schedule(
  'update-translation-stats',
  '0 4 * * *', -- Daily at 4 AM UTC
  $$
  -- Update translation priority scores based on recent activity
  UPDATE i18n_content_meta
  SET translation_priority = (
    SELECT COALESCE(
      SUM(
        CASE 
          WHEN key = 'total_views' THEN value::int * 10
          WHEN key = 'unique_users' THEN value::int * 20
          WHEN key = 'revenue_impact' THEN value::int * 30
          ELSE value::int
        END
      ), 0)
    FROM jsonb_each_text(view_count_by_locale)
  )
  WHERE created_at > NOW() - INTERVAL '30 days';
  $$
);

-- View all scheduled jobs
SELECT * FROM cron.job;