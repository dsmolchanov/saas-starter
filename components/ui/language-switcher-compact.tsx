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
import { locales, type Locale } from '@/i18n';

interface CompactLanguageSwitcherProps {
  currentLocale?: Locale;
  className?: string;
}

export function CompactLanguageSwitcher({ 
  currentLocale, 
  className 
}: CompactLanguageSwitcherProps) {
  const { locale, setLocale } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const actualLocale = currentLocale || locale;

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
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
          <span className="text-xs font-semibold">{getLanguageCode(actualLocale)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={`cursor-pointer justify-between ${
              locale === actualLocale ? 'bg-accent' : ''
            }`}
          >
            <span className="font-medium text-xs">{getLanguageCode(locale)}</span>
            <span className="text-xs text-gray-600">{getLanguageName(locale)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}