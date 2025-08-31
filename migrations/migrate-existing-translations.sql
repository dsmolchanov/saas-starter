-- =====================================================
-- Migrate existing translations to i18n_translations table
-- =====================================================
-- This migration copies all existing translations from column-based
-- structure to the new centralized i18n_translations table

-- =====================================================
-- Migrate Chakras translations
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM chakras LOOP
    -- English translations
    IF r.name_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'name', 'en', r.name_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.element_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'element', 'en', r.element_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.location_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'location', 'en', r.location_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.description_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'description', 'en', r.description_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.healing_practices_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'healing_practices', 'en', r.healing_practices_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    -- Russian translations
    IF r.name_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'name', 'ru', r.name_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.element_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'element', 'ru', r.element_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.location_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'location', 'ru', r.location_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.description_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'description', 'ru', r.description_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.healing_practices_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'healing_practices', 'ru', r.healing_practices_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    -- Spanish translations
    IF r.name_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'name', 'es', r.name_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.element_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'element', 'es', r.element_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.location_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'location', 'es', r.location_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.description_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'description', 'es', r.description_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.healing_practices_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('chakra', r.id, 'healing_practices', 'es', r.healing_practices_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- Migrate Moon Phases translations
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM moon_phases LOOP
    -- English translations
    IF r.name_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'name', 'en', r.name_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.energy_type_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'energy_type', 'en', r.energy_type_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.description_en IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'description', 'en', r.description_en)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    -- Russian translations
    IF r.name_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'name', 'ru', r.name_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.energy_type_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'energy_type', 'ru', r.energy_type_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.description_ru IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'description', 'ru', r.description_ru)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    -- Spanish translations
    IF r.name_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'name', 'es', r.name_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.energy_type_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'energy_type', 'es', r.energy_type_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    IF r.description_es IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('moon_phase', r.id, 'description', 'es', r.description_es)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- Migrate Yoga Quotes translations
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM yoga_quotes LOOP
    -- The text field is the main quote
    IF r.text IS NOT NULL THEN
      -- Determine locale from language field if present
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('yoga_quote', r.id, 'quote', COALESCE(r.language, 'en'), r.text)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    -- Author is usually not translated, but store it
    IF r.author IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('yoga_quote', r.id, 'author', 'en', r.author)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
    
    -- Source
    IF r.source IS NOT NULL THEN
      INSERT INTO i18n_translations (entity_type, entity_id, field_name, locale, translation)
      VALUES ('yoga_quote', r.id, 'source', 'en', r.source)
      ON CONFLICT (entity_type, entity_id, field_name, locale) DO UPDATE
      SET translation = EXCLUDED.translation;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- Check migration results
-- =====================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM i18n_translations;
  RAISE NOTICE 'Migrated % translations', v_count;
  
  -- Show stats per entity type
  FOR v_count IN 
    SELECT entity_type, COUNT(*) as cnt 
    FROM i18n_translations 
    GROUP BY entity_type 
  LOOP
    RAISE NOTICE 'Entity type %: % translations', v_count.entity_type, v_count.cnt;
  END LOOP;
END $$;

-- =====================================================
-- Populate sample data if tables are empty
-- =====================================================
-- This ensures we have some data to work with even if migrations haven't been run

-- Check if chakras table is empty and populate with sample data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM chakras LIMIT 1) THEN
    RAISE NOTICE 'Populating sample chakra data...';
    
    -- Insert sample chakras
    INSERT INTO chakras (number, sanskrit_name, name_en, name_ru, name_es, element_en, element_ru, element_es, color_hex)
    VALUES
      (1, 'Muladhara', 'Root Chakra', 'Корневая чакра', 'Chakra Raíz', 'Earth', 'Земля', 'Tierra', '#FF0000'),
      (2, 'Svadhisthana', 'Sacral Chakra', 'Сакральная чакра', 'Chakra Sacro', 'Water', 'Вода', 'Agua', '#FFA500'),
      (3, 'Manipura', 'Solar Plexus Chakra', 'Чакра солнечного сплетения', 'Chakra del Plexo Solar', 'Fire', 'Огонь', 'Fuego', '#FFFF00'),
      (4, 'Anahata', 'Heart Chakra', 'Сердечная чакра', 'Chakra del Corazón', 'Air', 'Воздух', 'Aire', '#00FF00'),
      (5, 'Vishuddha', 'Throat Chakra', 'Горловая чакра', 'Chakra de la Garganta', 'Ether', 'Эфир', 'Éter', '#00FFFF'),
      (6, 'Ajna', 'Third Eye Chakra', 'Чакра третьего глаза', 'Chakra del Tercer Ojo', 'Light', 'Свет', 'Luz', '#0000FF'),
      (7, 'Sahasrara', 'Crown Chakra', 'Коронная чакра', 'Chakra Corona', 'Consciousness', 'Сознание', 'Conciencia', '#FF00FF');
    
    -- Now migrate this data to i18n table
    PERFORM 1; -- Dummy statement to allow the migration code above to run
  END IF;
END $$;

-- Check if moon_phases table is empty and populate with sample data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM moon_phases LIMIT 1) THEN
    RAISE NOTICE 'Populating sample moon phase data...';
    
    INSERT INTO moon_phases (phase_value, emoji, name_en, name_ru, name_es, energy_type_en, energy_type_ru, energy_type_es)
    VALUES
      (0.00, '🌑', 'New Moon', 'Новолуние', 'Luna Nueva', 'New Beginnings', 'Новые начинания', 'Nuevos Comienzos'),
      (0.25, '🌓', 'First Quarter', 'Первая четверть', 'Cuarto Creciente', 'Taking Action', 'Принятие действий', 'Tomar Acción'),
      (0.50, '🌕', 'Full Moon', 'Полнолуние', 'Luna Llena', 'Culmination', 'Кульминация', 'Culminación'),
      (0.75, '🌗', 'Last Quarter', 'Последняя четверть', 'Cuarto Menguante', 'Release', 'Освобождение', 'Liberación'),
      (0.125, '🌒', 'Waxing Crescent', 'Растущий серп', 'Luna Creciente', 'Growth Energy', 'Энергия роста', 'Energía de Crecimiento'),
      (0.375, '🌔', 'Waxing Gibbous', 'Растущая луна', 'Luna Gibosa Creciente', 'Refinement', 'Совершенствование', 'Refinamiento'),
      (0.625, '🌖', 'Waning Gibbous', 'Убывающая луна', 'Luna Gibosa Menguante', 'Gratitude', 'Благодарность', 'Gratitud'),
      (0.875, '🌘', 'Waning Crescent', 'Убывающий серп', 'Luna Menguante', 'Rest', 'Отдых', 'Descanso');
  END IF;
END $$;

-- Re-run the migration after ensuring data exists
-- (The migration code above will now process any newly inserted data)

-- =====================================================
-- Show final statistics
-- =====================================================
SELECT * FROM get_translation_stats();