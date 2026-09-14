import type { Metadata } from "next";
import {
  getPublicNoteBySlug,
  getPublicProfileByHandle,
} from "@/lib/db/queries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translate";
import { OG_SIZE } from "@/lib/og/elements";
import { APP_NAME } from "@/lib/pwa";
import {
  localeFromSearchParams,
  publicNoteOgPath,
  publicNotePath,
  publicProfileOgPath,
  publicProfilePath,
} from "@/lib/sharing";

const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
};

export async function resolvePublicLocale(searchParams?: {
  lang?: string | string[];
}): Promise<Locale> {
  const fromQuery = searchParams ? localeFromSearchParams(searchParams) : null;
  if (fromQuery) return fromQuery;
  return getRequestLocale();
}

export async function resolvePublicLocaleFrom(
  searchParams: Promise<{ lang?: string | string[] }>,
): Promise<Locale> {
  return resolvePublicLocale(await searchParams);
}

function alternateLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

function localizedPublicUrl(
  pathForLocale: (locale: Locale) => string,
  locale: Locale,
) {
  return {
    canonical: pathForLocale(locale),
    languages: {
      en: pathForLocale("en"),
      es: pathForLocale("es"),
    },
  };
}

function socialImage(url: string, alt: string) {
  return {
    url,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt,
  };
}

export async function publicProfileMetadata(
  handle: string,
  locale: Locale,
): Promise<Metadata> {
  const profile = await getPublicProfileByHandle(handle);
  if (!profile) return { title: translate(locale, "nav.library") };

  const handleLabel = `@${handle}`;
  const title = translate(locale, "public.shelfTitle", { handle: handleLabel });
  const description = translate(locale, "public.metaProfileDescription", {
    handle: handleLabel,
  });
  const alt = translate(locale, "og.profileAlt", { handle: handleLabel });
  const image = socialImage(publicProfileOgPath(handle, locale), alt);
  const other = alternateLocale(locale);

  return {
    title,
    description,
    alternates: localizedPublicUrl(
      (next) => publicProfilePath(handle, next),
      locale,
    ),
    openGraph: {
      type: "profile",
      siteName: APP_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[other]],
      title,
      description,
      url: publicProfilePath(handle, locale),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export async function publicNoteMetadata(
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  const book = await getPublicNoteBySlug(slug);
  if (!book) return { title: translate(locale, "features.notesEyebrow") };

  const handleLabel = book.user.handle ? `@${book.user.handle}` : APP_NAME;
  const title = translate(locale, "public.metaNoteTitle", {
    handle: handleLabel,
    title: book.title,
  });
  const description = translate(locale, "public.metaNoteDescription", {
    handle: handleLabel,
    title: book.title,
  });
  const alt = translate(locale, "og.noteAlt", {
    handle: handleLabel,
    title: book.title,
  });
  const image = socialImage(publicNoteOgPath(slug, locale), alt);
  const other = alternateLocale(locale);

  return {
    title,
    description,
    alternates: localizedPublicUrl(
      (next) => publicNotePath(slug, next),
      locale,
    ),
    openGraph: {
      type: "article",
      siteName: APP_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[other]],
      title,
      description,
      url: publicNotePath(slug, locale),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function parseOgLocale(value: string): Locale | null {
  return isLocale(value) ? value : null;
}
