'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { COOKIE_NAME, type Locale, type Localized } from './config';
import { extractRichTextPlainText } from './richText';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

export type Dictionary = Record<string, unknown>;

interface LocaleContextProps {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
  getValue: (namespace: string, key: string) => unknown;
  resolveLocalized: <T>(value: Localized<T>) => T;
  t: (namespace: string, key: string) => string | SerializedEditorState | undefined;
  tPlain: (namespace: string, key: string) => string;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleProvider = ({ 
  children, 
  locale, 
  dictionaries,
}: { 
  children: React.ReactNode, 
  locale: Locale,
  dictionaries: Localized<Dictionary>,
}) => {
  const [activeLocale, setActiveLocale] = useState(locale);
  const [isPending, startTransition] = useTransition();
  const dictionary = dictionaries[activeLocale];

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  useEffect(() => {
    const nextDirection = activeLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = activeLocale;
    document.documentElement.dir = nextDirection;
    document.body.dir = nextDirection;
  }, [activeLocale]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === activeLocale) {
      return;
    }

    document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; samesite=lax`;

    startTransition(() => {
      setActiveLocale(newLocale);
    });
  };

  return (
    <LocaleContext.Provider
      value={{
        locale: activeLocale,
        dictionary,
        setLocale,
        isPending,
        getValue: (namespace: string, key: string) => {
          const keys = key.split('.');
          let value: unknown = contextValue(dictionary, namespace);

          for (const k of keys) {
            if (Array.isArray(value)) {
              const index = Number(k);
              value = Number.isInteger(index) ? value[index] : undefined;
            } else if (value && typeof value === 'object' && k in value) {
              value = (value as Record<string, unknown>)[k];
            } else {
              value = undefined;
            }

            if (value === undefined) break;
          }

          return value;
        },
        resolveLocalized: <T,>(value: Localized<T>) => value[activeLocale],
        t: (namespace: string, key: string) => {
          return contextValue(dictionary, namespace, key);
        },
        tPlain: (namespace: string, key: string) => {
          return extractRichTextPlainText(contextValue(dictionary, namespace, key));
        },
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

const contextValue = (dictionary: Dictionary, namespace: string, key?: string) => {
  if (!key) {
    return dictionary[namespace] as string | SerializedEditorState | undefined;
  }

  const keys = key.split('.');
  let value: unknown = dictionary[namespace];

  for (const k of keys) {
    if (Array.isArray(value)) {
      const index = Number(k);
      value = Number.isInteger(index) ? value[index] : undefined;
    } else if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      value = undefined;
    }

    if (value === undefined) break;
  }

  return value as string | SerializedEditorState | undefined;
};

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }

  return { 
    t: context.t,
    tPlain: context.tPlain,
    locale: context.locale, 
    setLocale: context.setLocale,
    isPending: context.isPending,
    getValue: context.getValue,
    resolveLocalized: context.resolveLocalized,
  };
};
