#!/usr/bin/env node

// Simple script to check MUX environment variables
console.log('🔍 Checking MUX Environment Variables...\n');

const requiredEnvVars = [
  'MUX_TOKEN_ID',
  'MUX_TOKEN_SECRET',
  'NEXT_PUBLIC_SITE_URL'
];

let allSet = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: Set (${value.length} characters)`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
    allSet = false;
  }
});

console.log('\n📋 Summary:');
if (allSet) {
  console.log('✅ All required MUX environment variables are set');
} else {
  console.log('❌ Some MUX environment variables are missing');
  console.log('\n📝 To fix this, add the missing variables to your .env.local file:');
  console.log('MUX_TOKEN_ID=your_mux_token_id');
  console.log('MUX_TOKEN_SECRET=your_mux_token_secret');
  console.log('NEXT_PUBLIC_SITE_URL=https://your-domain.com');
}

console.log('\n🔗 Get your MUX credentials at: https://dashboard.mux.com/settings/access-tokens');