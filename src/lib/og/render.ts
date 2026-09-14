import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { OG_SIZE } from "./elements";
import { loadOgFonts } from "./fonts";

export async function renderOgImage(element: ReactElement) {
  const fonts = await loadOgFonts();
  return new ImageResponse(element, {
    ...OG_SIZE,
    fonts,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export async function resolveCoverSrc(
  url: string | null,
): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { next: { revalidate: 86_400 } });
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const mime = response.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}
