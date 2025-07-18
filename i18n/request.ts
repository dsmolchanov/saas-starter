import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '../i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If locale is undefined or invalid, use default locale
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  try {
    return {
      messages: (await import(`../messages/${validLocale}.json`)).default
    };
  } catch (error) {
    // Fallback to default locale if there's an error loading messages
    console.warn(`Failed to load messages for locale "${validLocale}", falling back to "${defaultLocale}"`);
    return {
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }
}); 