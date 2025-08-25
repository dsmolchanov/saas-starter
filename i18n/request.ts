import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale } from '../i18n';

export default getRequestConfig(async () => {
  // Try to get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale');
  const locale = localeCookie?.value || defaultLocale;
  
  // Validate that the locale is valid
  const validLocale = locales.includes(locale as any) ? locale : defaultLocale;

  try {
    return {
      locale: validLocale,
      messages: (await import(`../messages/${validLocale}.json`)).default
    };
  } catch (error) {
    // Fallback to default locale if there's an error loading messages
    console.warn(`Failed to load messages for locale "${validLocale}", falling back to "${defaultLocale}"`);
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }
}); 