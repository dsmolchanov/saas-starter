#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTranslationSystem() {
  console.log('🧘 Testing Yoga App Translation System\n');

  try {
    // Step 1: Check if there are entities needing translation
    console.log('1. Checking for entities needing translation...');
    const { data: needingTranslation, error: needError } = await supabase
      .rpc('get_entities_needing_translation', { p_limit: 5 });

    if (needError) {
      console.error('Error checking entities:', needError);
      return;
    }

    if (!needingTranslation || needingTranslation.length === 0) {
      console.log('✅ All entities have complete translations!\n');
    } else {
      console.log(`Found ${needingTranslation.length} entities needing translation:`);
      needingTranslation.forEach((entity: any) => {
        console.log(`  - ${entity.entity_type} (${entity.entity_id})`);
        console.log(`    Existing: ${entity.existing_locales.join(', ')}`);
        console.log(`    Missing: ${entity.missing_locales.join(', ')}`);
      });
      console.log();
    }

    // Step 2: Test creating a new entity with translation
    console.log('2. Creating a test chakra with Russian content...');
    
    // First, create a test chakra in the chakras table
    const testChakraId = crypto.randomUUID();
    const { error: chakraError } = await supabase
      .from('chakras')
      .insert({
        id: testChakraId,
        number: 8, // Test chakra
        sanskrit_name: 'Test Chakra',
        color_hex: '#FFFFFF'
      });

    if (chakraError) {
      console.error('Error creating test chakra:', chakraError);
      return;
    }

    // Add Russian translations
    const { error: translationError } = await supabase
      .from('i18n_translations')
      .insert([
        {
          entity_type: 'chakra',
          entity_id: testChakraId,
          field_name: 'name',
          locale: 'ru',
          translation: 'Тестовая чакра'
        },
        {
          entity_type: 'chakra',
          entity_id: testChakraId,
          field_name: 'description',
          locale: 'ru',
          translation: 'Это тестовая чакра для проверки системы автоматического перевода'
        },
        {
          entity_type: 'chakra',
          entity_id: testChakraId,
          field_name: 'element',
          locale: 'ru',
          translation: 'Тестовый элемент'
        }
      ]);

    if (translationError) {
      console.error('Error adding translations:', translationError);
      return;
    }

    console.log('✅ Test chakra created with Russian content\n');

    // Step 3: Trigger auto-translation
    console.log('3. Triggering auto-translation...');
    console.log('   (Note: This requires GEMINI_API_KEY to be set in Supabase secrets)\n');

    const { data: translationResult, error: funcError } = await supabase.functions.invoke('auto-translate', {
      body: {
        entity_type: 'chakra',
        entity_id: testChakraId
      }
    });

    if (funcError) {
      console.error('Error calling translation function:', funcError);
      console.log('\n⚠️  Make sure to set GEMINI_API_KEY in Supabase:');
      console.log('   npx supabase secrets set GEMINI_API_KEY=your_api_key\n');
    } else {
      console.log('Translation result:', translationResult);
      
      if (translationResult.success) {
        console.log(`✅ Successfully translated ${translationResult.translations_count} fields`);
        console.log(`   Source: ${translationResult.source_locale}`);
        console.log(`   Targets: ${translationResult.target_locales?.join(', ')}\n`);

        // Step 4: Verify translations
        console.log('4. Verifying translations...');
        const { data: allTranslations, error: verifyError } = await supabase
          .from('i18n_translations')
          .select('*')
          .eq('entity_type', 'chakra')
          .eq('entity_id', testChakraId)
          .order('locale', { ascending: true })
          .order('field_name', { ascending: true });

        if (verifyError) {
          console.error('Error verifying translations:', verifyError);
        } else {
          console.log('\nAll translations for test chakra:');
          allTranslations?.forEach((trans: any) => {
            const autoTag = trans.is_auto_translated ? ' [AUTO]' : '';
            const confidence = trans.translation_confidence 
              ? ` (confidence: ${trans.translation_confidence})` 
              : '';
            console.log(`  ${trans.locale} - ${trans.field_name}: "${trans.translation}"${autoTag}${confidence}`);
          });
        }
      }
    }

    // Step 5: Check translation stats
    console.log('\n5. Translation Statistics:');
    const { data: stats, error: statsError } = await supabase
      .rpc('get_translation_stats');

    if (statsError) {
      console.error('Error getting stats:', statsError);
    } else {
      console.log('\nEntity Type | Total | EN | RU | ES | Auto | Reviewed');
      console.log('------------|-------|----|----|-------|------|----------');
      stats?.forEach((stat: any) => {
        console.log(
          `${stat.entity_type.padEnd(11)} | ${String(stat.total_entities).padEnd(5)} | ${String(stat.translations_en).padEnd(2)} | ${String(stat.translations_ru).padEnd(2)} | ${String(stat.translations_es).padEnd(5)} | ${String(stat.auto_translated).padEnd(4)} | ${stat.reviewed}`
        );
      });
    }

    // Cleanup
    console.log('\n6. Cleaning up test data...');
    await supabase
      .from('i18n_translations')
      .delete()
      .eq('entity_type', 'chakra')
      .eq('entity_id', testChakraId);

    await supabase
      .from('chakras')
      .delete()
      .eq('id', testChakraId);

    console.log('✅ Test data cleaned up\n');
    console.log('🎉 Translation system test complete!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testTranslationSystem();