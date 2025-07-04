export const locales = ['en', 'ru', 'es-MX'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';


export async function getMessages(locale: Locale) {
  switch (locale) {
    case 'ru':
      return (await import('./messages/ru.json')).default;
    case 'es-MX':
      return (await import('./messages/es-MX.json')).default;
    default:
      return (await import('./messages/en.json')).default;
  }
}

