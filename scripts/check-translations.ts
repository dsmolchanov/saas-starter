#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Load all translation files
const messagesDir = path.join(process.cwd(), 'messages');
const enMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'));
const ruMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'ru.json'), 'utf-8'));
const esMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'es.json'), 'utf-8'));

// Function to get all keys from nested object
function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

// Get all keys from each language
const enKeys = getAllKeys(enMessages);
const ruKeys = getAllKeys(ruMessages);
const esKeys = getAllKeys(esMessages);

// Find all unique keys
const allKeys = new Set([...enKeys, ...ruKeys, ...esKeys]);

// Check for missing keys in each language
const missingInEn: string[] = [];
const missingInRu: string[] = [];
const missingInEs: string[] = [];

allKeys.forEach(key => {
  if (!enKeys.includes(key)) missingInEn.push(key);
  if (!ruKeys.includes(key)) missingInRu.push(key);
  if (!esKeys.includes(key)) missingInEs.push(key);
});

// Report results
console.log('🌍 Translation Keys Analysis\n');
console.log('=' .repeat(50));

console.log(`\n📊 Statistics:`);
console.log(`Total unique keys: ${allKeys.size}`);
console.log(`English keys: ${enKeys.length}`);
console.log(`Russian keys: ${ruKeys.length}`);
console.log(`Spanish keys: ${esKeys.length}`);

if (missingInEn.length > 0) {
  console.log(`\n❌ Missing in English (en.json): ${missingInEn.length} keys`);
  missingInEn.forEach(key => console.log(`  - ${key}`));
}

if (missingInRu.length > 0) {
  console.log(`\n❌ Missing in Russian (ru.json): ${missingInRu.length} keys`);
  missingInRu.forEach(key => console.log(`  - ${key}`));
}

if (missingInEs.length > 0) {
  console.log(`\n❌ Missing in Spanish (es.json): ${missingInEs.length} keys`);
  missingInEs.forEach(key => console.log(`  - ${key}`));
}

if (missingInEn.length === 0 && missingInRu.length === 0 && missingInEs.length === 0) {
  console.log('\n✅ All translation files have the same keys!');
} else {
  console.log('\n⚠️  Translation files have inconsistencies!');
  
  // Generate missing translations report
  const report = {
    missingInEn,
    missingInRu,
    missingInEs,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'translation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to translation-report.json');
}

// Check for keys that exist in one language but not used as base (EN)
const extraInRu = ruKeys.filter(key => !enKeys.includes(key));
const extraInEs = esKeys.filter(key => !enKeys.includes(key));

if (extraInRu.length > 0) {
  console.log(`\n⚠️  Extra keys in Russian (not in English): ${extraInRu.length}`);
  extraInRu.forEach(key => console.log(`  - ${key}`));
}

if (extraInEs.length > 0) {
  console.log(`\n⚠️  Extra keys in Spanish (not in English): ${extraInEs.length}`);
  extraInEs.forEach(key => console.log(`  - ${key}`));
}

console.log('\n' + '=' .repeat(50));