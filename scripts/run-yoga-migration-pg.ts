import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Missing POSTGRES_URL environment variable');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Running yoga enhancement migration...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/0002_yoga_enhancements.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Execute the entire migration as a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the migration
      await client.query(migration);
      
      await client.query('COMMIT');
      console.log('✅ Yoga enhancement migration completed successfully!');
      
      // List created tables
      console.log('📋 The following tables were created:');
      const tables = [
        'breathing_exercises',
        'chakras',
        'yoga_quotes',
        'user_preferences',
        'practice_streaks',
        'class_tags',
        'yoga_styles',
        'class_equipment',
        'user_goals',
        'practice_reminders',
        'teacher_specializations',
        'meditation_sessions'
      ];
      
      for (const table of tables) {
        const result = await client.query(
          `SELECT COUNT(*) FROM ${table}`
        );
        console.log(`   - ${table} (${result.rows[0].count} records)`);
      }
      
      console.log('');
      console.log('🎯 Your yoga platform now has comprehensive practice management features!');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);