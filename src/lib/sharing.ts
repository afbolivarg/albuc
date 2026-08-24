import { nanoid } from "nanoid";
import { env } from "@/lib/env";

export function createShareSlug() {
  return nanoid(12);
}

export const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])?$/;

export function normalizeHandle(raw: string) {
  return decodeURIComponent(raw).trim().toLowerCase().replace(/^@+/, "");
}

export function publicProfilePath(handle: string) {
  return `/@${normalizeHandle(handle)}`;
}

export function publicNoteUrl(slug: string) {
  return `${env.NEXT_PUBLIC_SITE_URL}/n/${slug}`;
}
