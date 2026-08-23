import type { Locale } from "./config";
import { en, type MessageKey } from "./en";
import { es } from "./es";

const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, es };

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let value = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}
