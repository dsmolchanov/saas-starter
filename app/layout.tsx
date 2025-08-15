import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { Toaster } from '@/components/ui/toaster';

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

  return (
    <html lang={locale} className="bg-white dark:bg-gray-950 text-black dark:text-white">
      <head>
      </head>
      <body suppressHydrationWarning className="min-h-[100dvh] bg-gray-50">
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
        <Toaster />
      </body>
    </html>
  );
}
