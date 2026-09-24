import { DEFAULT_LOCALE, type Locale } from "@albuc/domain";

export const LOCALE_COOKIE = "albuc_locale";
export const LOCALE_LOCKED_COOKIE = "albuc_locale_locked";

export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALES,
  type Locale,
} from "@albuc/domain";

export function inferLocaleFromAcceptLanguage(
  header: string | null | undefined,
): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("es")) return "es";
  return DEFAULT_LOCALE;
}
