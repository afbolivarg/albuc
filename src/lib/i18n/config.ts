const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "albuc_locale";
export const LOCALE_LOCKED_COOKIE = "albuc_locale_locked";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "es";
}

export function inferLocaleFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("es")) return "es";
  return DEFAULT_LOCALE;
}
