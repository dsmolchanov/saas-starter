'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { locales, localeNames, type Locale } from '@/i18n';

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  className?: string;
}

export function LanguageSwitcher({ 
  currentLocale = 'ru', 
  className 
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      // Remove current locale from pathname if present
      let newPath = pathname;
      
      // Check if pathname starts with a locale
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments[0] && locales.includes(pathSegments[0] as Locale)) {
        // Remove the current locale
        pathSegments.shift();
        newPath = '/' + pathSegments.join('/');
      }
      
      // Add new locale (if not default Russian, as it can be omitted)
      if (newLocale !== 'ru') {
        newPath = `/${newLocale}${newPath}`;
      }
      
      // Navigate to the new path
      router.push(newPath);
      router.refresh();
      
      // Store preference in localStorage
      localStorage.setItem('preferred-language', newLocale);
      
      // Update document language
      document.documentElement.lang = newLocale;
      
      setIsOpen(false);
    });
  };

  const getFlagEmoji = (locale: Locale): string => {
    const flags: Record<Locale, string> = {
      ru: '🇷🇺',
      es: '🇪🇸',
      en: '🇬🇧',
    };
    return flags[locale];
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={className}
          disabled={isPending}
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {getFlagEmoji(currentLocale)} {localeNames[currentLocale]}
          </span>
          <span className="sm:hidden">
            {getFlagEmoji(currentLocale)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={`cursor-pointer ${
              locale === currentLocale ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{getFlagEmoji(locale)}</span>
            <span>{localeNames[locale]}</span>
            {locale === currentLocale && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}