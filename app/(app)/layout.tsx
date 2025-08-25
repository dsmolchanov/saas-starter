import { ReactNode } from 'react';
import { MobileNav } from '@/components/mobile-nav';
import { OAuthRedirectHandler } from '@/components/oauth-redirect-handler';
import { SimpleIntlProvider } from '@/components/providers/simple-intl-provider';
import { AppHeader } from '@/components/app-header';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SimpleIntlProvider>
      <div className="flex flex-col min-h-[100dvh]">
        <OAuthRedirectHandler />
        <AppHeader />
        <main className="flex-1 pb-16 pt-14">
          {children}
        </main>
        <MobileNav />
      </div>
    </SimpleIntlProvider>
  );
}
