#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const LANGUAGES = ['en', 'ru', 'es'];
const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class I18nValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  validateTranslations(): ValidationResult {
    console.log('🌍 Validating i18n translations...\n');

    // 1. Check if all language files exist
    this.checkLanguageFiles();

    // 2. Check if all keys are present in all languages
    this.checkTranslationKeys();

    // 3. Check for hardcoded strings
    this.checkHardcodedStrings();

    // 4. Check for unused translations
    this.checkUnusedTranslations();

    // 5. Validate placeholder consistency
    this.validatePlaceholders();

    // Generate report
    const valid = this.errors.length === 0;
    
    if (valid) {
      console.log('✅ All i18n validations passed!\n');
    } else {
      console.log(`❌ Found ${this.errors.length} error(s) and ${this.warnings.length} warning(s)\n`);
      
      if (this.errors.length > 0) {
        console.log('Errors:');
        this.errors.forEach(error => console.log(`  ❌ ${error}`));
      }
      
      if (this.warnings.length > 0) {
        console.log('\nWarnings:');
        this.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
      }
    }

    return {
      valid,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private checkLanguageFiles() {
    for (const lang of LANGUAGES) {
      const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing language file: ${lang}.json`);
      }
    }
  }

  private checkTranslationKeys() {
    const translations: Record<string, any> = {};
    const allKeys = new Set<string>();

    // Load all translations
    for (const lang of LANGUAGES) {
      const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
      if (fs.existsSync(filePath)) {
        translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const keys = this.getAllKeys(translations[lang]);
        keys.forEach(key => allKeys.add(key));
      }
    }

    // Check for missing keys in each language
    for (const lang of LANGUAGES) {
      if (!translations[lang]) continue;
      
      const langKeys = new Set(this.getAllKeys(translations[lang]));
      const missing = Array.from(allKeys).filter(key => !langKeys.has(key));
      
      if (missing.length > 0) {
        this.errors.push(`Missing ${missing.length} key(s) in ${lang}.json: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
      }
    }
  }

  private checkHardcodedStrings() {
    try {
      // Run a simple grep to find potential hardcoded strings
      const result = execSync(
        `grep -r ">[A-Z][a-z].*</" --include="*.tsx" components/ app/ 2>/dev/null | wc -l`,
        { encoding: 'utf-8' }
      ).trim();
      
      const count = parseInt(result, 10);
      if (count > 0) {
        this.warnings.push(`Found ${count} potential hardcoded strings in JSX elements`);
      }
    } catch (error) {
      // Grep might fail if no matches, that's okay
    }
  }

  private checkUnusedTranslations() {
    const translations = JSON.parse(
      fs.readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf-8')
    );
    
    const allKeys = this.getAllKeys(translations);
    const usedKeys = new Set<string>();

    // Check which keys are actually used in the codebase
    try {
      for (const key of allKeys) {
        const keyParts = key.split('.');
        const lastPart = keyParts[keyParts.length - 1];
        
        // Check if the key is used (simplified check)
        const searchPattern = `['"\`]${lastPart}['"\`]`;
        const result = execSync(
          `grep -r "${searchPattern}" --include="*.tsx" --include="*.ts" components/ app/ 2>/dev/null | head -1`,
          { encoding: 'utf-8' }
        ).trim();
        
        if (result) {
          usedKeys.add(key);
        }
      }

      const unusedKeys = allKeys.filter(key => !usedKeys.has(key));
      if (unusedKeys.length > 20) {
        this.warnings.push(`Found ${unusedKeys.length} potentially unused translation keys`);
      }
    } catch (error) {
      // Grep might fail, that's okay
    }
  }

  private validatePlaceholders() {
    const translations: Record<string, any> = {};

    // Load all translations
    for (const lang of LANGUAGES) {
      const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
      if (fs.existsSync(filePath)) {
        translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    }

    // Get all keys from English (base language)
    const enKeys = this.getAllKeys(translations.en);

    for (const key of enKeys) {
      const enValue = this.getValueByKey(translations.en, key);
      if (typeof enValue !== 'string') continue;

      // Extract placeholders from English value
      const enPlaceholders = enValue.match(/\{\{[^}]+\}\}/g) || [];
      
      // Check other languages
      for (const lang of LANGUAGES.filter(l => l !== 'en')) {
        const langValue = this.getValueByKey(translations[lang], key);
        if (typeof langValue !== 'string') continue;

        const langPlaceholders = langValue.match(/\{\{[^}]+\}\}/g) || [];
        
        // Check if placeholders match
        if (enPlaceholders.length !== langPlaceholders.length) {
          this.warnings.push(
            `Placeholder mismatch in ${lang}.json for key "${key}": ` +
            `expected ${enPlaceholders.length}, found ${langPlaceholders.length}`
          );
        }
      }
    }
  }

  private getAllKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(this.getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  private getValueByKey(obj: any, key: string): any {
    const parts = key.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }
}

// Run validation
const validator = new I18nValidator();
const result = validator.validateTranslations();

// Exit with error code if validation failed
if (!result.valid) {
  process.exit(1);
}