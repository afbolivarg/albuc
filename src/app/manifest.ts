import type { MetadataRoute } from "next";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  APP_BACKGROUND_COLOR,
  APP_DESCRIPTION,
  APP_NAME,
  APP_THEME_COLOR,
} from "@/lib/pwa";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getRequestLocale();
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
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
        name: "Library",
        short_name: "Library",
        description: "Open your personal library",
        url: "/library",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Ask",
        short_name: "Ask",
        description: "Ask questions about your books",
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
