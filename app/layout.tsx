import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '../i18n';

// Force all pages to use dynamic rendering to avoid i18n static generation issues
export const dynamic = 'force-dynamic';

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

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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

  // Get messages for the locale with fallback
  let messages = {};
  try {
    messages = await getMessages();
  } catch {
    // Fallback to empty messages if loading fails during build
    messages = {};
  }

  return (
    <html lang={locale} className="bg-white dark:bg-gray-950 text-black dark:text-white">
      <head>
      </head>
      <body suppressHydrationWarning className="min-h-[100dvh] bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <SWRConfig
            value={{
              fallback: {
                // Don't pre-load user data during static generation
                // This will be loaded client-side on demand
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
