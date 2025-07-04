export const locales = ['en', 'ru', 'es-MX'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';
