"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Locale } from "./config";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./config";
import type { MessageKey } from "./en";
import { isMessageKey, translate } from "./translate";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

function localeFromDocumentCookie(): Locale {
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  return isLocale(match) ? match : DEFAULT_LOCALE;
}

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [current, setCurrent] = useState(locale);

  useEffect(() => {
    const sync = () => {
      const fromCookie = localeFromDocumentCookie();
      setCurrent(fromCookie);
      document.documentElement.lang = fromCookie;
    };
    sync();
    window.addEventListener("albuc:locale", sync);
    return () => window.removeEventListener("albuc:locale", sync);
  }, []);

  return (
    <LocaleContext.Provider value={current}>{children}</LocaleContext.Provider>
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
