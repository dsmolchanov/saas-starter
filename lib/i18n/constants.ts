// Common UI strings that should always be translated
export const UI_STRINGS = {
  // Actions
  SAVE: 'save',
  CANCEL: 'cancel',
  DELETE: 'delete',
  EDIT: 'edit',
  CREATE: 'create',
  UPDATE: 'update',
  SUBMIT: 'submit',
  CLOSE: 'close',
  OPEN: 'open',
  SELECT: 'select',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  SEARCH: 'search',
  FILTER: 'filter',
  SORT: 'sort',
  
  // Navigation
  PREVIOUS: 'previous',
  NEXT: 'next',
  BACK: 'back',
  CONTINUE: 'continue',
  
  // States
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  
  // Common labels
  NAME: 'name',
  EMAIL: 'email',
  PASSWORD: 'password',
  DESCRIPTION: 'description',
  TITLE: 'title',
  DATE: 'date',
  TIME: 'time',
  DURATION: 'duration',
  
  // Status
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  DRAFT: 'draft',
  
  // Visibility
  PUBLIC: 'public',
  PRIVATE: 'private',
  
  // Time
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  TOMORROW: 'tomorrow',
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months',
  YEARS: 'years',
} as const;

// Helper function to ensure a string is translated
export function ensureTranslated(key: string, namespace?: string): string {
  if (namespace) {
    return `${namespace}.${key}`;
  }
  return key;
}

// Type-safe translation keys
export type TranslationKey = keyof typeof UI_STRINGS;

// Available languages
export const LANGUAGES = ['en', 'ru', 'es'] as const;
export type Language = typeof LANGUAGES[number];

// Default language
export const DEFAULT_LANGUAGE: Language = 'en';

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
};