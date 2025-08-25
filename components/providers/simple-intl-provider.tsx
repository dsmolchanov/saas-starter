'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import ruMessages from '@/messages/ru.json';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Messages = typeof ruMessages;
type Locale = 'ru' | 'es' | 'en';

interface IntlContextType {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

const messagesMap: Record<Locale, Messages> = {
  ru: ruMessages,
  es: esMessages,
  en: enMessages,
};

export function SimpleIntlProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocaleState] = useState<Locale>('ru');
  const [messages, setMessages] = useState<Messages>(ruMessages);

  useEffect(() => {
    // Get locale from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-language') as Locale;
      if (savedLocale && messagesMap[savedLocale]) {
        setLocaleState(savedLocale);
        setMessages(messagesMap[savedLocale]);
      }
      setMounted(true);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (messagesMap[newLocale]) {
      setLocaleState(newLocale);
      setMessages(messagesMap[newLocale]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', newLocale);
        document.documentElement.lang = newLocale;
      }
    }
  };

  // During SSR and initial hydration, always use default locale to prevent mismatches
  // After mounting, use the saved locale from localStorage
  const currentLocale = mounted ? locale : 'ru';
  const currentMessages = mounted ? messages : ruMessages;

  return (
    <IntlContext.Provider value={{ locale: currentLocale, messages: currentMessages, setLocale }}>
      {children}
    </IntlContext.Provider>
  );
}

export function useIntl() {
  const context = useContext(IntlContext);
  if (!context) {
    throw new Error('useIntl must be used within SimpleIntlProvider');
  }
  return context;
}

export function useTranslations(namespace: keyof Messages) {
  const { messages } = useIntl();
  const namespaceMessages = messages[namespace];
  
  return (key: string) => {
    const keys = key.split('.');
    let value: any = namespaceMessages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${namespace}.${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}