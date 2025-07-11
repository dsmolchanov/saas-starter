import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
// Load variables from .env.local first (Next.js convention) and fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

async function setupSupabase() {
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
    console.log('🚀 Setting up Supabase database...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/supabase-sync.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migration });

    if (error) {
      console.error('❌ Error executing migration:', error);
      throw error;
    }

    console.log('✅ Supabase database setup completed successfully!');
    console.log('📋 The following tables were created/updated:');
    console.log('   - categories');
    console.log('   - courses');
    console.log('   - focus_areas');
    console.log('   - lessons');
    console.log('   - lesson_focus_areas');
    console.log('   - progress');
    console.log('   - subscriptions');
    console.log('   - teachers');
    console.log('   - playlists');
    console.log('   - playlist_items');
    console.log('');
    console.log('🔒 Row Level Security (RLS) policies have been enabled');
    console.log('🔑 All tables use UUID primary keys and reference auth.users');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Allow running the migration in parts if needed
async function setupSupabaseInteractive() {
  console.log('This script will set up your Supabase database with the complete yoga app schema.');
  console.log('Make sure you have the following environment variables set:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('');

  // Simple confirmation (you can enhance this with a proper CLI library)
  console.log('⚠️  This will create tables and enable RLS policies in your Supabase database.');
  console.log('Continue? (Run with --force to skip this prompt)');

  if (!process.argv.includes('--force')) {
    // Exit if not forced - user should run with --force when ready
    console.log('Add --force flag to proceed: npm run setup:supabase -- --force');
    process.exit(0);
  }

  await setupSupabase();
}

setupSupabaseInteractive().catch(console.error); 