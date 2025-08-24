import { headers } from 'next/headers';
import { type Locale, locales, defaultLocale } from '@/i18n';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

/**
 * Get locale from request headers or cookies
 */
export async function getLocaleFromRequest(): Promise<Locale> {
  const headersList = await headers();
  
  // Check Accept-Language header
  const acceptLanguage = headersList.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',');
    for (const lang of languages) {
      const locale = lang.split('-')[0].toLowerCase();
      if (locales.includes(locale as Locale)) {
        return locale as Locale;
      }
    }
  }
  
  // Check cookie
  const cookie = headersList.get('cookie');
  if (cookie) {
    const match = cookie.match(/preferred-language=([^;]+)/);
    if (match && locales.includes(match[1] as Locale)) {
      return match[1] as Locale;
    }
  }
  
  return defaultLocale;
}

/**
 * Get translations for an entity from the database
 */
export async function getTranslations(
  entityType: string,
  entityId: string,
  language: Locale
): Promise<Record<string, string>> {
  const result = await db.execute(
    sql`
      SELECT field_name, translated_text
      FROM translations
      WHERE entity_type = ${entityType}
        AND entity_id = ${entityId}::uuid
        AND language = ${language}
    `
  );
  
  const translations: Record<string, string> = {};
  for (const row of result) {
    translations[row.field_name as string] = row.translated_text as string;
  }
  
  return translations;
}

/**
 * Add or update translations for an entity
 */
export async function setTranslations(
  entityType: string,
  entityId: string,
  language: Locale,
  translations: Record<string, string>
): Promise<void> {
  for (const [fieldName, text] of Object.entries(translations)) {
    await db.execute(
      sql`
        INSERT INTO translations (entity_type, entity_id, language, field_name, translated_text)
        VALUES (${entityType}, ${entityId}::uuid, ${language}, ${fieldName}, ${text})
        ON CONFLICT (entity_type, entity_id, language, field_name)
        DO UPDATE SET 
          translated_text = EXCLUDED.translated_text,
          updated_at = CURRENT_TIMESTAMP
      `
    );
  }
}

/**
 * Get content with translations
 */
export async function getContentWithTranslations<T extends Record<string, any>>(
  content: T,
  entityType: string,
  locale: Locale
): Promise<T & { translations?: Record<string, string> }> {
  if (!content.id) return content;
  
  const translations = await getTranslations(entityType, content.id, locale);
  
  // Apply translations to content
  const translatedContent = { ...content } as any;
  for (const [field, value] of Object.entries(translations)) {
    if (field in translatedContent) {
      translatedContent[field] = value;
    }
  }
  
  // Add source_language indicator if different from requested
  if (content.source_language && content.source_language !== locale) {
    translatedContent._isTranslated = true;
    translatedContent._sourceLanguage = content.source_language;
  }
  
  return translatedContent;
}

/**
 * Batch get translations for multiple entities
 */
export async function getBatchTranslations(
  entityType: string,
  entityIds: string[],
  language: Locale
): Promise<Map<string, Record<string, string>>> {
  if (entityIds.length === 0) return new Map();
  
  const result = await db.execute(
    sql`
      SELECT entity_id, field_name, translated_text
      FROM translations
      WHERE entity_type = ${entityType}
        AND entity_id = ANY(${entityIds}::uuid[])
        AND language = ${language}
    `
  );
  
  const translationsMap = new Map<string, Record<string, string>>();
  
  for (const row of result) {
    const entityId = row.entity_id as string;
    const fieldName = row.field_name as string;
    const text = row.translated_text as string;
    
    if (!translationsMap.has(entityId)) {
      translationsMap.set(entityId, {});
    }
    
    const entityTranslations = translationsMap.get(entityId)!;
    entityTranslations[fieldName] = text;
  }
  
  return translationsMap;
}

/**
 * Apply translations to a list of content items
 */
export async function applyTranslationsToList<T extends { id: string }>(
  items: T[],
  entityType: string,
  locale: Locale
): Promise<T[]> {
  if (items.length === 0) return items;
  
  const ids = items.map(item => item.id);
  const translationsMap = await getBatchTranslations(entityType, ids, locale);
  
  return items.map(item => {
    const translations = translationsMap.get(item.id);
    if (!translations) return item;
    
    const translatedItem = { ...item };
    for (const [field, value] of Object.entries(translations)) {
      if (field in translatedItem) {
        (translatedItem as any)[field] = value;
      }
    }
    
    return translatedItem;
  });
}

/**
 * Get available languages for an entity
 */
export async function getAvailableLanguages(
  entityType: string,
  entityId: string
): Promise<Locale[]> {
  const result = await db.execute(
    sql`
      SELECT DISTINCT language
      FROM translations
      WHERE entity_type = ${entityType}
        AND entity_id = ${entityId}::uuid
    `
  );
  
  return result.map(row => row.language as Locale);
}

/**
 * Copy translations from one entity to another
 */
export async function copyTranslations(
  sourceEntityType: string,
  sourceEntityId: string,
  targetEntityType: string,
  targetEntityId: string
): Promise<void> {
  await db.execute(
    sql`
      INSERT INTO translations (entity_type, entity_id, language, field_name, translated_text)
      SELECT 
        ${targetEntityType},
        ${targetEntityId}::uuid,
        language,
        field_name,
        translated_text
      FROM translations
      WHERE entity_type = ${sourceEntityType}
        AND entity_id = ${sourceEntityId}::uuid
      ON CONFLICT (entity_type, entity_id, language, field_name)
      DO UPDATE SET 
        translated_text = EXCLUDED.translated_text,
        updated_at = CURRENT_TIMESTAMP
    `
  );
}

/**
 * Delete all translations for an entity
 */
export async function deleteTranslations(
  entityType: string,
  entityId: string
): Promise<void> {
  await db.execute(
    sql`
      DELETE FROM translations
      WHERE entity_type = ${entityType}
        AND entity_id = ${entityId}::uuid
    `
  );
}