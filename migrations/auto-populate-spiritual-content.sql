-- Auto-populate spiritual content for future dates
-- This ensures we always have content available

-- Function to populate chakra daily focus
CREATE OR REPLACE FUNCTION populate_chakra_daily_focus(days_ahead INTEGER DEFAULT 30)
RETURNS void AS $$
DECLARE
    target_date DATE;
    chakra_count INTEGER;
    chakra_id UUID;
BEGIN
    -- Get the count of chakras
    SELECT COUNT(*) INTO chakra_count FROM chakras;
    
    -- Start from tomorrow
    target_date := CURRENT_DATE + 1;
    
    -- Populate for the specified number of days
    FOR i IN 0..days_ahead LOOP
        -- Check if entry already exists
        IF NOT EXISTS (SELECT 1 FROM chakra_daily_focus WHERE date = target_date) THEN
            -- Use day of year modulo chakra count to cycle through chakras
            SELECT id INTO chakra_id 
            FROM chakras 
            WHERE number = ((EXTRACT(DOY FROM target_date)::INTEGER - 1) % chakra_count) + 1;
            
            INSERT INTO chakra_daily_focus (date, chakra_id)
            VALUES (target_date, chakra_id)
            ON CONFLICT (date) DO NOTHING;
        END IF;
        
        target_date := target_date + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to populate daily quotes
CREATE OR REPLACE FUNCTION populate_daily_quotes(days_ahead INTEGER DEFAULT 30)
RETURNS void AS $$
DECLARE
    target_date DATE;
    quote_count INTEGER;
    quote_id UUID;
    used_quotes UUID[] := '{}';
BEGIN
    -- Get the count of quotes
    SELECT COUNT(*) INTO quote_count FROM yoga_quotes;
    
    -- Start from tomorrow
    target_date := CURRENT_DATE + 1;
    
    -- Populate for the specified number of days
    FOR i IN 0..days_ahead LOOP
        -- Check if entry already exists
        IF NOT EXISTS (SELECT 1 FROM daily_quotes WHERE date = target_date) THEN
            -- Select a quote that hasn't been used recently
            SELECT id INTO quote_id
            FROM yoga_quotes
            WHERE id != ALL(used_quotes)
            ORDER BY RANDOM()
            LIMIT 1;
            
            -- If all quotes have been used, reset the list
            IF quote_id IS NULL THEN
                used_quotes := '{}';
                SELECT id INTO quote_id
                FROM yoga_quotes
                ORDER BY RANDOM()
                LIMIT 1;
            END IF;
            
            -- Add to used quotes array (keep last 7 quotes)
            used_quotes := array_append(used_quotes, quote_id);
            IF array_length(used_quotes, 1) > 7 THEN
                used_quotes := used_quotes[2:array_length(used_quotes, 1)];
            END IF;
            
            INSERT INTO daily_quotes (date, quote_id)
            VALUES (target_date, quote_id)
            ON CONFLICT (date) DO NOTHING;
        END IF;
        
        target_date := target_date + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to populate moon calendar with calculated phases
CREATE OR REPLACE FUNCTION populate_moon_calendar(days_ahead INTEGER DEFAULT 30)
RETURNS void AS $$
DECLARE
    target_date DATE;
    lunar_cycle NUMERIC := 29.53059;
    known_new_moon TIMESTAMP := '2024-01-11T00:00:00Z';
    days_since_new_moon NUMERIC;
    calculated_phase NUMERIC;
    phase_id UUID;
    illumination NUMERIC;
BEGIN
    -- Start from tomorrow
    target_date := CURRENT_DATE + 1;
    
    -- Populate for the specified number of days
    FOR i IN 0..days_ahead LOOP
        -- Check if entry already exists
        IF NOT EXISTS (SELECT 1 FROM moon_calendar WHERE date = target_date) THEN
            -- Calculate moon phase
            days_since_new_moon := (target_date - known_new_moon::DATE)::NUMERIC;
            calculated_phase := (days_since_new_moon % lunar_cycle) / lunar_cycle;
            
            -- Ensure calculated_phase is positive
            IF calculated_phase < 0 THEN
                calculated_phase := calculated_phase + 1;
            END IF;
            
            -- Find the closest moon phase
            SELECT id INTO phase_id
            FROM moon_phases
            ORDER BY ABS(moon_phases.phase_value - calculated_phase) ASC
            LIMIT 1;
            
            -- Calculate illumination (simplified)
            IF calculated_phase <= 0.5 THEN
                illumination := calculated_phase * 200; -- Waxing: 0% to 100%
            ELSE
                illumination := (1 - calculated_phase) * 200; -- Waning: 100% to 0%
            END IF;
            
            INSERT INTO moon_calendar (date, phase_id, exact_phase, illumination_percent)
            VALUES (target_date, phase_id, calculated_phase, illumination)
            ON CONFLICT (date) DO NOTHING;
        END IF;
        
        target_date := target_date + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job function that can be called periodically
CREATE OR REPLACE FUNCTION auto_populate_spiritual_content()
RETURNS void AS $$
BEGIN
    -- Populate 30 days ahead for each type
    PERFORM populate_chakra_daily_focus(30);
    PERFORM populate_daily_quotes(30);
    PERFORM populate_moon_calendar(30);
END;
$$ LANGUAGE plpgsql;

-- Populate initial data
SELECT auto_populate_spiritual_content();

-- Optional: Create a trigger to auto-populate when getting close to running out
-- This would need to be called periodically (e.g., daily via cron job or scheduled task)
COMMENT ON FUNCTION auto_populate_spiritual_content() IS 
'Call this function daily via a scheduled job to ensure spiritual content is always available 30 days ahead';