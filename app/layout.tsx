import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../i18n';

export const metadata: Metadata = {
  title: 'Dzen Yoga - Find Your Perfect Practice',
  description: 'Discover yoga teachers you will love. Customize your practice with any duration, style and length.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  maximumScale: 1
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}) {
  // Get locale from params or use default
  const resolvedParams = params ? await params : {};
  const locale = resolvedParams.locale || 'ru';
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className="bg-white dark:bg-gray-950 text-black dark:text-white">
      <head>
      </head>
      <body suppressHydrationWarning className="min-h-[100dvh] bg-gray-50">
        <NextIntlClientProvider messages={messages}>
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
