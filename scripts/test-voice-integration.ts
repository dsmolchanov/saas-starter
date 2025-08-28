#!/usr/bin/env node
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load .env.local file explicitly
config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration
const VOICE_SUPABASE_URL = process.env.VOICE_SUPABASE_URL!;
const VOICE_SUPABASE_SERVICE_KEY = process.env.VOICE_SUPABASE_SERVICE_KEY!;
const VOICE_AGENT_API_URL = process.env.VOICE_AGENT_API_URL!;

async function testVoiceIntegration() {
  console.log('🔍 Testing Voice AI Integration...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const requiredVars = {
    VOICE_SUPABASE_URL,
    VOICE_SUPABASE_SERVICE_KEY,
    VOICE_AGENT_API_URL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    LIVEKIT_URL: process.env.LIVEKIT_URL
  };

  let allVarsPresent = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.includes('your-')) {
      console.log(`   ❌ ${key} is missing or not configured`);
      allVarsPresent = false;
    } else {
      console.log(`   ✅ ${key} is configured`);
    }
  }

  if (!allVarsPresent) {
    console.log('\n⚠️  Some environment variables are missing. Please configure them.\n');
  }

  // Test 2: Connect to Voice Platform Supabase
  console.log('\n2️⃣ Testing Voice Platform Supabase connection...');
  try {
    const voiceSupabase = createClient(
      VOICE_SUPABASE_URL,
      VOICE_SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try to query agent_configs table
    const { data, error } = await voiceSupabase
      .from('agent_configs')
      .select('agent_id')
      .limit(1);

    if (error) {
      console.log(`   ❌ Failed to connect: ${error.message}`);
    } else {
      console.log(`   ✅ Successfully connected to Voice Platform Supabase`);
      console.log(`   📊 Found ${data?.length || 0} agent configs`);
    }
  } catch (error) {
    console.log(`   ❌ Connection error: ${error}`);
  }

  // Test 3: Check Voice Agent API
  console.log('\n3️⃣ Testing Voice Agent API endpoint...');
  try {
    const response = await fetch(VOICE_AGENT_API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Dzen-Yoga-Test'
      }
    });

    if (response.ok) {
      console.log(`   ✅ Voice Agent API is reachable at ${VOICE_AGENT_API_URL}`);
      console.log(`   📡 Status: ${response.status} ${response.statusText}`);
    } else {
      console.log(`   ⚠️  Voice Agent API returned ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Cannot reach Voice Agent API: ${error}`);
  }

  // Test 4: Create a test yoga agent configuration
  console.log('\n4️⃣ Testing yoga agent configuration creation...');
  try {
    const voiceSupabase = createClient(
      VOICE_SUPABASE_URL,
      VOICE_SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const testAgentConfig = {
      agent_id: 'yoga_instructor_test_v1',
      name: 'Test Yoga Instructor',
      config: {
        system_prompt: 'You are a test yoga instructor.',
        llm: { model: 'gpt-4o', temperature: 0.7 },
        tts: { provider: 'openai', voice: 'alloy' },
        stt: { provider: 'deepgram', model: 'nova-2' }
      },
      platform: 'dzen-yoga',
      platform_metadata: {
        test: true,
        created_by: 'integration-test'
      }
    };

    const { data, error } = await voiceSupabase
      .from('agent_configs')
      .upsert(testAgentConfig, { onConflict: 'agent_id' })
      .select();

    if (error) {
      console.log(`   ❌ Failed to create agent config: ${error.message}`);
    } else {
      console.log(`   ✅ Successfully created/updated test agent config`);
      console.log(`   🤖 Agent ID: ${testAgentConfig.agent_id}`);
    }
  } catch (error) {
    console.log(`   ❌ Error creating agent config: ${error}`);
  }

  // Test 5: Check if platform_sessions table exists
  console.log('\n5️⃣ Checking Voice Platform database schema...');
  try {
    const voiceSupabase = createClient(
      VOICE_SUPABASE_URL,
      VOICE_SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try to query platform_sessions table
    const { error } = await voiceSupabase
      .from('platform_sessions')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`   ⚠️  platform_sessions table doesn't exist yet`);
        console.log(`   📝 Run the migration: migrations/voice_platform_integration.sql`);
      } else {
        console.log(`   ❌ Error checking table: ${error.message}`);
      }
    } else {
      console.log(`   ✅ platform_sessions table exists`);
    }
  } catch (error) {
    console.log(`   ❌ Error checking schema: ${error}`);
  }

  console.log('\n✨ Integration test complete!\n');
  
  // Summary
  console.log('📋 Summary:');
  console.log('   - Environment variables: ' + (allVarsPresent ? '✅ All configured' : '⚠️ Some missing'));
  console.log('   - Voice Platform Supabase: Check results above');
  console.log('   - Voice Agent API: Check results above');
  console.log('   - Next steps:');
  console.log('     1. Ensure all environment variables are configured');
  console.log('     2. Run migrations on Voice Platform Supabase if needed');
  console.log('     3. Test creating a voice session through the API');
}

// Run the test
testVoiceIntegration().catch(console.error);