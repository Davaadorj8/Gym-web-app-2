'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { messages, Locale } from '@/lib/messages';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
});

export const useAppLocale = () => useContext(I18nContext);

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Locale {
  try {
    const saved = localStorage.getItem('app_locale') as Locale | null;
    if (saved === 'en' || saved === 'mn') {
      return saved;
    }
  } catch {
    // ignore storage access errors
  }
  return 'en';
}

function getServerSnapshot(): Locale {
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = (newLocale: Locale) => {
    try {
      localStorage.setItem('app_locale', newLocale);
    } catch {
      // ignore storage access errors
    }
    listeners.forEach((l) => l());
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
