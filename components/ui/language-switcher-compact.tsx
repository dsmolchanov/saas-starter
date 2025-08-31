'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useIntl } from '@/components/providers/simple-intl-provider';

type Locale = 'ru' | 'es' | 'en';

interface CompactLanguageSwitcherProps {
  className?: string;
}

export function CompactLanguageSwitcher({ 
  className 
}: CompactLanguageSwitcherProps) {
  const { locale, setLocale } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const locales: Locale[] = ['ru', 'es', 'en'];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
    
    // Force a page refresh to update server-side rendered content
    // This ensures all server components fetch new localized data
    if (typeof window !== 'undefined') {
      // Add a query parameter to trigger middleware and then reload
      const url = new URL(window.location.href);
      url.searchParams.set('setLocale', newLocale);
      window.location.href = url.toString();
    }
  };

  const getLanguageCode = (locale: Locale): string => {
    const codes: Record<Locale, string> = {
      ru: 'RU',
      es: 'ES',
      en: 'EN',
    };
    return codes[locale];
  };

  const getLanguageName = (locale: Locale): string => {
    const names: Record<Locale, string> = {
      ru: 'Русский',
      es: 'Español',
      en: 'English',
    };
    return names[locale];
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`h-8 w-8 rounded-lg border border-gray-200 hover:border-gray-300 ${className}`}
        >
          <span className="text-xs font-semibold">{getLanguageCode(locale)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={`cursor-pointer justify-between ${
              loc === locale ? 'bg-accent' : ''
            }`}
          >
            <span className="font-medium text-xs">{getLanguageCode(loc)}</span>
            <span className="text-xs text-gray-600">{getLanguageName(loc)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}