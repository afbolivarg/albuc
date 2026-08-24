import { cookies, headers } from "next/headers";
import {
  inferLocaleFromAcceptLanguage,
  isLocale,
  LOCALE_COOKIE,
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

export function localeFromFormData(
  formData: FormData | undefined,
): Locale | null {
  const value = formData?.get("locale");
  return typeof value === "string" && isLocale(value) ? value : null;
}

export async function t(
  key: MessageKey,
  vars?: Record<string, string | number>,
  locale?: Locale | null,
): Promise<string> {
  return translate(locale ?? (await getRequestLocale()), key, vars);
}

export async function actionT(
  formData: FormData | undefined,
  key: MessageKey,
  vars?: Record<string, string | number>,
): Promise<string> {
  return t(key, vars, localeFromFormData(formData));
}
