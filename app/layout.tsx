import './globals.css';
import type { Metadata, Viewport } from 'next';
// Removed font import to avoid network fetch during build
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

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


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white dark:bg-gray-950 text-black dark:text-white">
      <head>
      </head>
      <body suppressHydrationWarning className="min-h-[100dvh] bg-gray-50">
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
      </body>
    </html>
  );
}
