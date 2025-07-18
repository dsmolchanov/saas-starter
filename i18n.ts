export const locales = ['ru', 'en', 'es-MX'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'ru';
