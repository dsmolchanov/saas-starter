-- Set up cron job for automatic spiritual content population
-- This should be run after the automatic-spiritual-population.sql migration

-- Check if pg_cron is available and schedule the job
DO $$
BEGIN
    -- Check if cron schema exists
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') THEN
        -- Remove existing job if it exists
        DELETE FROM cron.job WHERE jobname = 'populate-spiritual-content';
        
        -- Schedule new job to run daily at 3 AM UTC
        INSERT INTO cron.job (jobname, schedule, command)
        VALUES (
            'populate-spiritual-content',
            '0 3 * * *',  -- 3 AM UTC daily
            'SELECT daily_spiritual_population();'
        );
        
        RAISE NOTICE 'Cron job scheduled successfully';
    ELSE
        RAISE NOTICE 'pg_cron not available - content will be populated on first access each day';
    END IF;
END $$;