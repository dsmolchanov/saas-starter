import { ReactNode } from 'react';
import { MobileNav } from '@/components/mobile-nav';
import { OAuthRedirectHandler } from '@/components/oauth-redirect-handler';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <OAuthRedirectHandler />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
