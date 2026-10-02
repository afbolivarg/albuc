import { HANDLE_RE, normalizeHandle } from "@albuc/domain";
import { nanoid } from "nanoid";
import { env } from "@/lib/env";
import { isLocale, type Locale } from "@/lib/i18n/config";

export { HANDLE_RE, normalizeHandle };

export function createShareSlug() {
  return nanoid(12);
}

export const LANG_PARAM = "lang";

export function profileHandleFromParam(handle: string) {
  const decoded = decodeURIComponent(handle);
  if (!decoded.startsWith("@")) return null;
  const normalized = normalizeHandle(decoded);
  return normalized || null;
}

export function localeFromSearchParams(searchParams: {
  lang?: string | string[];
}): Locale | null {
  const raw = searchParams.lang;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isLocale(value) ? value : null;
}

function withLang(path: string, locale?: Locale | null) {
  if (!locale) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${LANG_PARAM}=${locale}`;
}

export function publicProfilePath(handle: string, locale?: Locale | null) {
  return withLang(`/@${normalizeHandle(handle)}`, locale);
}

export function publicNotePath(slug: string, locale?: Locale | null) {
  return withLang(`/n/${slug}`, locale);
}

export function publicNoteUrl(slug: string, locale?: Locale | null) {
  return `${env.NEXT_PUBLIC_SITE_URL}${publicNotePath(slug, locale)}`;
}

export function publicProfileOgPath(handle: string, locale: Locale) {
  return `/og/profile/${normalizeHandle(handle)}/${locale}`;
}

export function publicNoteOgPath(slug: string, locale: Locale) {
  return `/og/note/${slug}/${locale}`;
}
