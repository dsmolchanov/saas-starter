import './globals.css';
import type { Metadata, Viewport } from 'next';
// Removed font import to avoid network fetch during build
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { locales, defaultLocale, getMessages } from '@/i18n';

export const metadata: Metadata = {
  title: 'Next.js SaaS Starter',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.'
};

export const viewport: Viewport = {
  maximumScale: 1
};


export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as
    | (typeof locales[number])
    | undefined;
  const locale = locales.includes(cookieLocale as any)
    ? (cookieLocale as typeof locales[number])
    : defaultLocale;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} className="bg-white dark:bg-gray-950 text-black dark:text-white">
      <body className="min-h-[100dvh] bg-gray-50">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SWRConfig
            value={{
              fallback: {
                // We do NOT await here
                // Only components that read this data will suspend
                '/api/user': getUser(),
                '/api/team': getTeamForUser()
              }
            }}
          >
            {children}
          </SWRConfig>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
