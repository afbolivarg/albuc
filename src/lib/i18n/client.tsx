"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";
import type { Locale } from "./config";
import { DEFAULT_LOCALE } from "./config";
import type { MessageKey } from "./en";
import { isMessageKey, translate } from "./translate";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  const locale = useLocale();
  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
}

export function useActionMessage() {
  const t = useT();
  return (value?: string | null, vars?: Record<string, string | number>) => {
    if (!value) return null;
    return isMessageKey(value) ? t(value, vars) : value;
  };
}
