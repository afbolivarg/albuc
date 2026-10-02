import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const CONTENT_ROOT = join(here, "..");
export const INBOX_DIR = join(CONTENT_ROOT, "inbox");
export const BOOKS_DIR = join(CONTENT_ROOT, "books");
export const BRAND_DIR = join(CONTENT_ROOT, "brand");
export const FIXTURES_DIR = join(CONTENT_ROOT, "fixtures");
export const TEMPLATES_DIR = join(BRAND_DIR, "templates");

export function bookDir(slug: string) {
  return join(BOOKS_DIR, slug);
}

export function packsDir(slug: string) {
  return join(bookDir(slug), "packs");
}

export function outDir(slug: string) {
  return join(bookDir(slug), "out");
}
