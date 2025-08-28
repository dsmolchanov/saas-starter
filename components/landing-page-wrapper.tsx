'use client';

import { SimpleIntlProvider } from '@/components/providers/simple-intl-provider';
import { SimpleLanguageToggle } from '@/components/simple-language-toggle';
import { MobileNav } from '@/components/mobile-nav';

export function LandingPageHeader() {
  return (
    <SimpleIntlProvider>
      <SimpleLanguageToggle />
    </SimpleIntlProvider>
  );
}

export function LandingPageNav() {
  return (
    <SimpleIntlProvider>
      <MobileNav />
    </SimpleIntlProvider>
  );
}