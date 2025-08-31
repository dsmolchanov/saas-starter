-- Automatic spiritual content population system
-- This ensures content is always available without manual intervention

-- 1. Create a trigger function that checks and populates content when queried
CREATE OR REPLACE FUNCTION ensure_spiritual_content_exists()
RETURNS trigger AS $$
BEGIN
    -- Check if we have content for the next 7 days
    IF NOT EXISTS (
        SELECT 1 FROM chakra_daily_focus 
        WHERE date = CURRENT_DATE + INTERVAL '7 days'
    ) THEN
        -- Populate next 30 days if we're running low
        PERFORM populate_chakra_daily_focus(30);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM daily_quotes 
        WHERE date = CURRENT_DATE + INTERVAL '7 days'
    ) THEN
        PERFORM populate_daily_quotes(30);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM moon_calendar 
        WHERE date = CURRENT_DATE + INTERVAL '7 days'
    ) THEN
        PERFORM populate_moon_calendar(30);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a tracking table for population runs
CREATE TABLE IF NOT EXISTS spiritual_population_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    days_populated INTEGER NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create an automatic population function that runs daily
CREATE OR REPLACE FUNCTION daily_spiritual_population()
RETURNS void AS $$
DECLARE
    days_to_populate INTEGER := 35; -- Always maintain 35 days ahead
    last_chakra_date DATE;
    last_quote_date DATE;
    last_moon_date DATE;
    days_needed INTEGER;
BEGIN
    -- Get the last populated dates
    SELECT MAX(date) INTO last_chakra_date FROM chakra_daily_focus;
    SELECT MAX(date) INTO last_quote_date FROM daily_quotes;
    SELECT MAX(date) INTO last_moon_date FROM moon_calendar;
    
    -- Populate chakras if needed
    IF last_chakra_date IS NULL OR last_chakra_date < CURRENT_DATE + INTERVAL '30 days' THEN
        days_needed := COALESCE(
            EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '35 days' - COALESCE(last_chakra_date, CURRENT_DATE)))::INTEGER,
            35
        );
        PERFORM populate_chakra_daily_focus(days_needed);
    END IF;
    
    -- Populate quotes if needed
    IF last_quote_date IS NULL OR last_quote_date < CURRENT_DATE + INTERVAL '30 days' THEN
        days_needed := COALESCE(
            EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '35 days' - COALESCE(last_quote_date, CURRENT_DATE)))::INTEGER,
            35
        );
        PERFORM populate_daily_quotes(days_needed);
    END IF;
    
    -- Populate moon calendar if needed
    IF last_moon_date IS NULL OR last_moon_date < CURRENT_DATE + INTERVAL '30 days' THEN
        days_needed := COALESCE(
            EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '35 days' - COALESCE(last_moon_date, CURRENT_DATE)))::INTEGER,
            35
        );
        PERFORM populate_moon_calendar(days_needed);
    END IF;
    
    -- Log the run
    INSERT INTO spiritual_population_log (days_populated)
    VALUES (days_to_populate);
    
    -- Clean up old log entries (keep last 30 days)
    DELETE FROM spiritual_population_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
EXCEPTION WHEN OTHERS THEN
    -- Log error
    INSERT INTO spiritual_population_log (days_populated, success, error_message)
    VALUES (0, false, SQLERRM);
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a function that can be called on first access each day
CREATE OR REPLACE FUNCTION check_and_populate_spiritual_content()
RETURNS void AS $$
BEGIN
    -- Check if we already ran today
    IF NOT EXISTS (
        SELECT 1 FROM spiritual_population_log 
        WHERE run_date = CURRENT_DATE 
        AND success = true
    ) THEN
        PERFORM daily_spiritual_population();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers on the spiritual content tables that ensure data exists
CREATE OR REPLACE FUNCTION ensure_today_spiritual_content()
RETURNS trigger AS $$
BEGIN
    -- If querying for today or future dates, ensure content exists
    IF TG_OP = 'SELECT' OR TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM check_and_populate_spiritual_content();
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the original operation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Install pg_cron extension for scheduled jobs (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 7. Schedule daily population at 3 AM UTC
-- Note: This requires pg_cron to be enabled in Supabase dashboard
DO $$
BEGIN
    -- Remove existing job if it exists
    PERFORM cron.unschedule('populate-spiritual-content');
    
    -- Schedule new job
    PERFORM cron.schedule(
        'populate-spiritual-content',  -- job name
        '0 3 * * *',                   -- cron expression (3 AM UTC daily)
        $$SELECT daily_spiritual_population();$$
    );
EXCEPTION WHEN OTHERS THEN
    -- If pg_cron is not available, continue without scheduling
    RAISE NOTICE 'pg_cron not available, skipping scheduled job creation';
END $$;

-- 8. Create a function that can be called from the application
CREATE OR REPLACE FUNCTION public.ensure_spiritual_content_available()
RETURNS json AS $$
DECLARE
    result json;
    chakra_count INTEGER;
    quote_count INTEGER;
    moon_count INTEGER;
BEGIN
    -- Ensure content exists
    PERFORM check_and_populate_spiritual_content();
    
    -- Get counts of available future content
    SELECT COUNT(*) INTO chakra_count 
    FROM chakra_daily_focus 
    WHERE date >= CURRENT_DATE;
    
    SELECT COUNT(*) INTO quote_count 
    FROM daily_quotes 
    WHERE date >= CURRENT_DATE;
    
    SELECT COUNT(*) INTO moon_count 
    FROM moon_calendar 
    WHERE date >= CURRENT_DATE;
    
    -- Return status
    result := json_build_object(
        'success', true,
        'chakra_days_available', chakra_count,
        'quote_days_available', quote_count,
        'moon_days_available', moon_count,
        'last_populated', (SELECT MAX(created_at) FROM spiritual_population_log WHERE success = true)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_spiritual_content_available() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_populate_spiritual_content() TO authenticated;

-- 9. Create RLS policies for the log table
ALTER TABLE spiritual_population_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view population log" ON spiritual_population_log
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- 10. Run initial population
SELECT daily_spiritual_population();

COMMENT ON FUNCTION daily_spiritual_population() IS 
'Automatically populates spiritual content 35 days ahead. Called daily by pg_cron at 3 AM UTC.';

COMMENT ON FUNCTION ensure_spiritual_content_available() IS 
'Public function that can be called from the application to ensure spiritual content is available.';