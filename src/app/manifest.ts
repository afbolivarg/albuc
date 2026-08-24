import type { MetadataRoute } from "next";
import { getRequestLocale, t } from "@/lib/i18n/server";
import { APP_BACKGROUND_COLOR, APP_NAME, APP_THEME_COLOR } from "@/lib/pwa";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getRequestLocale();
  const description = await t("home.metaDescription");
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_NAME,
    description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "any",
    lang: locale,
    dir: "ltr",
    theme_color: APP_THEME_COLOR,
    background_color: APP_BACKGROUND_COLOR,
    categories: ["books", "lifestyle", "productivity"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: await t("nav.library"),
        short_name: await t("nav.library"),
        description: await t("nav.library"),
        url: "/library",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: await t("nav.ask"),
        short_name: await t("nav.ask"),
        description: await t("ask.empty"),
        url: "/library/ask",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
