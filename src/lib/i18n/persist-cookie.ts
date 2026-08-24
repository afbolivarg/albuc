import { LOCALE_COOKIE, LOCALE_LOCKED_COOKIE, type Locale } from "./config";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export function persistLocaleCookies(locale: Locale) {
  const attrs = `Path=/; Max-Age=${TEN_YEARS}; SameSite=Lax`;
  document.cookie = `${LOCALE_COOKIE}=${locale}; ${attrs}`;
  document.cookie = `${LOCALE_LOCKED_COOKIE}=1; ${attrs}`;
}
