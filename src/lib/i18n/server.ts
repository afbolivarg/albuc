import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  inferLocaleFromAcceptLanguage,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_LOCKED_COOKIE,
  type Locale,
} from "./config";
import type { MessageKey } from "./en";
import { translate } from "./translate";

export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  const accept = (await headers()).get("accept-language");
  return inferLocaleFromAcceptLanguage(accept);
}

export async function isRequestLocaleLocked(): Promise<boolean> {
  const store = await cookies();
  return store.get(LOCALE_LOCKED_COOKIE)?.value === "1";
}

export async function t(
  key: MessageKey,
  vars?: Record<string, string | number>,
): Promise<string> {
  return translate(await getRequestLocale(), key, vars);
}
