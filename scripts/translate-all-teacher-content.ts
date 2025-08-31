#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Target languages for all content
const TARGET_LOCALES = ['en', 'es', 'ru'];

async function detectSourceLanguage(text: string): Promise<string> {
  // Simple detection based on character sets
  if (/[а-яА-Я]/.test(text)) return 'ru';
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
  return 'en';
}

async function translateCourses() {
  console.log('\n📚 Translating Courses...\n');
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, description, teacher_id');
  
  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }

  for (const course of courses || []) {
    console.log(`\nProcessing course: ${course.title}`);
    
    // Detect source language
    const sourceLocale = await detectSourceLanguage(course.title + ' ' + (course.description || ''));
    console.log(`  Detected language: ${sourceLocale}`);
    
    // Add to i18n_translations if not exists
    const fields = [
      { name: 'title', value: course.title },
      { name: 'description', value: course.description }
    ].filter(f => f.value);
    
    for (const field of fields) {
      // Insert source translation
      await supabase
        .from('i18n_translations')
        .upsert({
          entity_type: 'course',
          entity_id: course.id,
          field_name: field.name,
          locale: sourceLocale,
          translation: field.value,
          is_auto_translated: false
        }, {
          onConflict: 'entity_type,entity_id,field_name,locale'
        });
    }
    
    // Trigger translation
    console.log(`  Triggering translation to other languages...`);
    const { data: result, error: translateError } = await supabase.functions.invoke('auto-translate', {
      body: {
        entity_type: 'course',
        entity_id: course.id,
        source_locale: sourceLocale,
        target_locales: TARGET_LOCALES.filter(l => l !== sourceLocale)
      }
    });
    
    if (translateError) {
      console.error(`  ❌ Translation failed:`, translateError);
    } else if (result?.success) {
      console.log(`  ✅ Translated ${result.translations_count} fields`);
    } else {
      console.log(`  ⚠️  ${result?.message || 'No translations needed'}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function translateClasses() {
  console.log('\n🧘 Translating Classes...\n');
  
  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, title, description, style, difficulty, teacher_id');
  
  if (error) {
    console.error('Error fetching classes:', error);
    return;
  }

  for (const cls of classes || []) {
    console.log(`\nProcessing class: ${cls.title}`);
    
    // Detect source language
    const sourceLocale = await detectSourceLanguage(cls.title + ' ' + (cls.description || ''));
    console.log(`  Detected language: ${sourceLocale}`);
    
    // Add to i18n_translations
    const fields = [
      { name: 'title', value: cls.title },
      { name: 'description', value: cls.description }
    ].filter(f => f.value);
    
    for (const field of fields) {
      await supabase
        .from('i18n_translations')
        .upsert({
          entity_type: 'class',
          entity_id: cls.id,
          field_name: field.name,
          locale: sourceLocale,
          translation: field.value,
          is_auto_translated: false
        }, {
          onConflict: 'entity_type,entity_id,field_name,locale'
        });
    }
    
    // Trigger translation
    console.log(`  Triggering translation...`);
    const { data: result, error: translateError } = await supabase.functions.invoke('auto-translate', {
      body: {
        entity_type: 'class',
        entity_id: cls.id,
        source_locale: sourceLocale,
        target_locales: TARGET_LOCALES.filter(l => l !== sourceLocale)
      }
    });
    
    if (translateError) {
      console.error(`  ❌ Translation failed:`, translateError);
    } else if (result?.success) {
      console.log(`  ✅ Translated ${result.translations_count} fields`);
    } else {
      console.log(`  ⚠️  ${result?.message || 'No translations needed'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function translateTeacherProfiles() {
  console.log('\n👨‍🏫 Translating Teacher Profiles...\n');
  
  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('id, bio, specialties, user:users(name)');
  
  if (error) {
    console.error('Error fetching teachers:', error);
    return;
  }

  for (const teacher of teachers || []) {
    const teacherName = teacher.user?.name || 'Unknown Teacher';
    console.log(`\nProcessing teacher: ${teacherName}`);
    
    if (!teacher.bio) {
      console.log(`  No bio to translate`);
      continue;
    }
    
    // Detect source language
    const sourceLocale = detectSourceLanguage(teacher.bio);
    console.log(`  Detected language: ${sourceLocale}`);
    
    // Add bio to i18n_translations
    await supabase
      .from('i18n_translations')
      .upsert({
        entity_type: 'teacher',
        entity_id: teacher.id,
        field_name: 'bio',
        locale: sourceLocale,
        translation: teacher.bio,
        is_auto_translated: false
      }, {
        onConflict: 'entity_type,entity_id,field_name,locale'
      });
    
    // Add specialties if exists
    if (teacher.specialties) {
      const specialtiesText = Array.isArray(teacher.specialties) 
        ? teacher.specialties.join(', ') 
        : teacher.specialties;
        
      await supabase
        .from('i18n_translations')
        .upsert({
          entity_type: 'teacher',
          entity_id: teacher.id,
          field_name: 'specialties',
          locale: sourceLocale,
          translation: specialtiesText,
          is_auto_translated: false
        }, {
          onConflict: 'entity_type,entity_id,field_name,locale'
        });
    }
    
    // Trigger translation
    console.log(`  Triggering translation...`);
    const { data: result, error: translateError } = await supabase.functions.invoke('auto-translate', {
      body: {
        entity_type: 'teacher',
        entity_id: teacher.id,
        source_locale: sourceLocale,
        target_locales: TARGET_LOCALES.filter(l => l !== sourceLocale)
      }
    });
    
    if (translateError) {
      console.error(`  ❌ Translation failed:`, translateError);
    } else if (result?.success) {
      console.log(`  ✅ Translated ${result.translations_count} fields`);
    } else {
      console.log(`  ⚠️  ${result?.message || 'No translations needed'}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function getTranslationStats() {
  console.log('\n📊 Translation Statistics\n');
  
  const { data: stats, error } = await supabase
    .from('i18n_translations')
    .select('entity_type, locale')
    .in('entity_type', ['course', 'class', 'teacher']);
  
  if (error) {
    console.error('Error fetching stats:', error);
    return;
  }
  
  // Count by entity type and locale
  const counts: Record<string, Record<string, number>> = {};
  
  for (const item of stats || []) {
    if (!counts[item.entity_type]) {
      counts[item.entity_type] = {};
    }
    counts[item.entity_type][item.locale] = (counts[item.entity_type][item.locale] || 0) + 1;
  }
  
  console.table(counts);
  
  // Total counts
  const totals = {
    total_translations: stats?.length || 0,
    auto_translated: stats?.filter(s => s.is_auto_translated).length || 0,
    manual: stats?.filter(s => !s.is_auto_translated).length || 0
  };
  
  console.log('\nTotals:');
  console.table(totals);
}

async function main() {
  console.log('🌍 Starting Teacher Content Translation\n');
  console.log('Target languages:', TARGET_LOCALES.join(', '));
  console.log('=' .repeat(50));
  
  try {
    // First check if teacher entity type exists
    const { error: alterError } = await supabase.rpc('sql', {
      query: `
        ALTER TYPE i18n_entity_type ADD VALUE IF NOT EXISTS 'teacher';
      `
    }).single();
    
    if (alterError && !alterError.message?.includes('already exists')) {
      console.log('Note: Teacher entity type might not be in enum, using workaround');
    }
    
    // Translate all content types
    await translateCourses();
    await translateClasses();
    // await translateTeacherProfiles(); // Uncomment if teacher type is added to enum
    
    // Show final statistics
    await getTranslationStats();
    
    console.log('\n✅ Translation process complete!');
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();