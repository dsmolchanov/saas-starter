#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const EXCLUDE_PATTERNS = [
  'import',
  'export',
  'interface',
  'type',
  'className',
  'href',
  'src',
  'alt',
  'key',
  'id',
  'name',
  'value',
  'data-',
  'aria-',
  'style',
  'console.log',
  'console.error',
  'throw new Error',
];

const COMMON_UI_STRINGS = [
  'Loading',
  'Error',
  'Save',
  'Cancel',
  'Delete',
  'Edit',
  'Create',
  'Update',
  'Submit',
  'Close',
  'Open',
  'Select',
  'Choose',
  'Upload',
  'Download',
  'Search',
  'Filter',
  'Sort',
  'Previous',
  'Next',
  'Back',
  'Continue',
  'Confirm',
  'Yes',
  'No',
  'OK',
  'Apply',
  'Reset',
  'Clear',
  'Add',
  'Remove',
  'View',
  'Show',
  'Hide',
  'More',
  'Less',
  'All',
  'None',
  'Required',
  'Optional',
  'Success',
  'Warning',
  'Info',
  'Settings',
  'Profile',
  'Logout',
  'Login',
  'Register',
  'Sign in',
  'Sign up',
  'Sign out',
  'Forgot password',
  'Reset password',
  'Change password',
  'Email',
  'Password',
  'Username',
  'Name',
  'Description',
  'Title',
  'Date',
  'Time',
  'Duration',
  'Price',
  'Total',
  'Subtotal',
  'Tax',
  'Discount',
  'Quantity',
  'Available',
  'Unavailable',
  'Active',
  'Inactive',
  'Enabled',
  'Disabled',
  'Public',
  'Private',
  'Draft',
  'Published',
  'Pending',
  'Approved',
  'Rejected',
  'Completed',
  'In progress',
  'Not started',
  'Scheduled',
  'Expired',
  'New',
  'Popular',
  'Featured',
  'Recommended',
  'Trending',
  'Recent',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
  'ago',
  'Today',
  'Yesterday',
  'Tomorrow',
  'This week',
  'Last week',
  'This month',
  'Last month',
  'This year',
  'Last year',
];

async function findHardcodedStrings() {
  const files = await glob('**/*.{tsx,ts}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.test.ts',
      '*.spec.ts',
      'scripts/**',
    ],
  });

  const hardcodedStrings: Record<string, string[]> = {};
  let totalHardcoded = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const fileHardcoded: string[] = [];

    lines.forEach((line, index) => {
      // Skip lines with exclude patterns
      if (EXCLUDE_PATTERNS.some(pattern => line.includes(pattern))) {
        return;
      }

      // Check for strings in JSX elements: >Text</
      const jsxMatches = line.match(/>\s*([A-Z][a-zA-Z\s]+)\s*</g);
      if (jsxMatches) {
        jsxMatches.forEach(match => {
          const text = match.replace(/[><]/g, '').trim();
          if (text.length > 2 && /[A-Z]/.test(text)) {
            fileHardcoded.push(`Line ${index + 1}: JSX text: "${text}"`);
          }
        });
      }

      // Check for placeholder attributes
      const placeholderMatches = line.match(/placeholder=["']([^{][^"']+)["']/g);
      if (placeholderMatches) {
        placeholderMatches.forEach(match => {
          const text = match.match(/placeholder=["']([^"']+)["']/)?.[1];
          if (text) {
            fileHardcoded.push(`Line ${index + 1}: Placeholder: "${text}"`);
          }
        });
      }

      // Check for title attributes
      const titleMatches = line.match(/title=["']([^{][^"']+)["']/g);
      if (titleMatches) {
        titleMatches.forEach(match => {
          const text = match.match(/title=["']([^"']+)["']/)?.[1];
          if (text && text.length > 2) {
            fileHardcoded.push(`Line ${index + 1}: Title attribute: "${text}"`);
          }
        });
      }

      // Check for label attributes
      const labelMatches = line.match(/label=["']([^{][^"']+)["']/g);
      if (labelMatches) {
        labelMatches.forEach(match => {
          const text = match.match(/label=["']([^"']+)["']/)?.[1];
          if (text) {
            fileHardcoded.push(`Line ${index + 1}: Label: "${text}"`);
          }
        });
      }

      // Check for common UI strings
      COMMON_UI_STRINGS.forEach(uiString => {
        const regex = new RegExp(`["'\`]${uiString}["'\`]`, 'g');
        if (regex.test(line) && !line.includes('t(') && !line.includes('useTranslations')) {
          fileHardcoded.push(`Line ${index + 1}: Common UI string: "${uiString}"`);
        }
      });
    });

    if (fileHardcoded.length > 0) {
      hardcodedStrings[file] = fileHardcoded;
      totalHardcoded += fileHardcoded.length;
    }
  }

  // Generate report
  console.log('\n📝 Hardcoded Strings Report\n');
  console.log('=' .repeat(60));
  console.log(`\nTotal files scanned: ${files.length}`);
  console.log(`Files with hardcoded strings: ${Object.keys(hardcodedStrings).length}`);
  console.log(`Total hardcoded strings found: ${totalHardcoded}\n`);

  if (totalHardcoded > 0) {
    console.log('Files with hardcoded strings:\n');
    
    Object.entries(hardcodedStrings).forEach(([file, strings]) => {
      console.log(`\n📄 ${file} (${strings.length} hardcoded strings):`);
      strings.slice(0, 5).forEach(str => console.log(`  - ${str}`));
      if (strings.length > 5) {
        console.log(`  ... and ${strings.length - 5} more`);
      }
    });

    // Save detailed report
    fs.writeFileSync(
      'hardcoded-strings-report.json',
      JSON.stringify(hardcodedStrings, null, 2)
    );
    
    console.log('\n📊 Detailed report saved to hardcoded-strings-report.json');
  } else {
    console.log('✅ No obvious hardcoded strings found!');
  }

  console.log('\n' + '=' .repeat(60));
}

findHardcodedStrings().catch(console.error);