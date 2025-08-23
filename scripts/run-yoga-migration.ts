import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🚀 Running yoga enhancement migration...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/0002_yoga_enhancements.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Split migration into individual statements (by semicolon)
    const statements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      }).single();

      if (error) {
        // Check if it's a "already exists" error which we can ignore
        if (error.message?.includes('already exists')) {
          console.log(`⚠️  Table/index already exists, skipping...`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          throw error;
        }
      }
    }

    console.log('✅ Yoga enhancement migration completed successfully!');
    console.log('📋 The following tables were created/updated:');
    console.log('   - breathing_exercises (with default data)');
    console.log('   - chakras (with 7 chakras)');
    console.log('   - yoga_quotes (with inspirational quotes)');
    console.log('   - user_preferences');
    console.log('   - practice_streaks');
    console.log('   - class_tags');
    console.log('   - yoga_styles (with common styles)');
    console.log('   - class_equipment');
    console.log('   - user_goals');
    console.log('   - practice_reminders');
    console.log('   - teacher_specializations');
    console.log('   - meditation_sessions');
    console.log('');
    console.log('🎯 Your yoga platform now has comprehensive practice management features!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runMigration().catch(console.error);