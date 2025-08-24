'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { type Locale, locales, defaultLocale } from '@/i18n';

/**
 * Hook to get the current locale from the URL or localStorage
 */
export function useLocale(): Locale {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Check URL for locale
    const pathSegments = (pathname || '/').split('/').filter(Boolean);
    const urlLocale = pathSegments[0];
    
    if (urlLocale && locales.includes(urlLocale as Locale)) {
      setLocale(urlLocale as Locale);
      return;
    }

    // Check localStorage for preference
    const savedLocale = localStorage.getItem('preferred-language');
    if (savedLocale && locales.includes(savedLocale as Locale)) {
      setLocale(savedLocale as Locale);
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && locales.includes(browserLang as Locale)) {
      setLocale(browserLang as Locale);
      return;
    }

    // Default to Russian
    setLocale('ru');
  }, [pathname]);

  return locale;
}

/**
 * Hook to get translated content from the API
 */
export function useTranslatedContent<T extends Record<string, any>>(
  content: T | null,
  locale?: Locale
): T | null {
  const currentLocale = locale || useLocale();
  const [translatedContent, setTranslatedContent] = useState<T | null>(content);

  useEffect(() => {
    if (!content) {
      setTranslatedContent(null);
      return;
    }

    // If content has translations property, use it
    if ('translations' in content && content.translations) {
      const translations = content.translations as Record<string, any>;
      if (translations[currentLocale]) {
        setTranslatedContent({
          ...content,
          ...translations[currentLocale],
        });
        return;
      }
    }

    // Otherwise return original content
    setTranslatedContent(content);
  }, [content, currentLocale]);

  return translatedContent;
}

/**
 * Hook to manage language preferences
 */
export function useLanguagePreference() {
  const [preference, setPreference] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem('preferred-language');
    if (saved && locales.includes(saved as Locale)) {
      setPreference(saved as Locale);
    }
  }, []);

  const updatePreference = (locale: Locale) => {
    localStorage.setItem('preferred-language', locale);
    setPreference(locale);
    document.documentElement.lang = locale;
  };

  return { preference, updatePreference };
}

/**
 * Format date according to locale
 */
export function useLocalizedDate(date: Date | string, locale?: Locale): string {
  const currentLocale = locale || useLocale();
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const localeMap: Record<Locale, string> = {
    ru: 'ru-RU',
    es: 'es-ES',
    en: 'en-US',
  };

  return new Date(date).toLocaleDateString(localeMap[currentLocale], formatOptions);
}

/**
 * Format number according to locale
 */
export function useLocalizedNumber(
  number: number,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string {
  const currentLocale = locale || useLocale();
  
  const localeMap: Record<Locale, string> = {
    ru: 'ru-RU',
    es: 'es-ES',
    en: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[currentLocale], options).format(number);
}

/**
 * Get pluralized form based on locale rules
 */
export function usePluralize(
  count: number,
  forms: { one: string; few?: string; many: string },
  locale?: Locale
): string {
  const currentLocale = locale || useLocale();

  if (currentLocale === 'ru') {
    // Russian pluralization rules
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) {
      return forms.one;
    } else if (forms.few && mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return forms.few;
    } else {
      return forms.many;
    }
  } else {
    // English and Spanish
    return count === 1 ? forms.one : forms.many;
  }
}