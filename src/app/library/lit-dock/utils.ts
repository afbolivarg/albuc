import type { Book } from "@/lib/db/schema";
import { parseSpineColors } from "@/lib/spine-colors.shared";
import { getBookCoverUrl } from "@/lib/supabase/book-covers.shared";
import { PALETTES, type PaletteKey } from "./constants";
import type { ShelfBook, SortDir, SortKey } from "./types";

const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];

export function hashJitter(id: string, lo: number, hi: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return lo + (h % (hi - lo + 1));
}

export function spineWidth(book: Pick<ShelfBook, "pages">) {
  return Math.max(36, Math.min(56, Math.round(book.pages / 13)));
}

function paletteForBook(id: string): PaletteKey {
  return PALETTE_KEYS[hashJitter(id, 0, PALETTE_KEYS.length - 1)];
}

export function makeCover(
  title: string,
  author: string,
  palette: readonly [string, string, string],
) {
  const [bg1, bg2, ink] = palette;
  const safe = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const words = title.split(" ");
  const line1 = words.slice(0, 3).join(" ");
  const line2 = words.length > 3 ? words.slice(3, 6).join(" ") : "";
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='240' height='360' viewBox='0 0 240 360'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stop-color='${bg1}'/>
          <stop offset='1' stop-color='${bg2}'/>
        </linearGradient>
      </defs>
      <rect width='240' height='360' fill='url(#g)'/>
      <rect x='13' y='13' width='214' height='334' fill='none' stroke='${ink}' stroke-opacity='0.28'/>
      <text x='120' y='146' text-anchor='middle' fill='${ink}' font-family='EB Garamond, Georgia, serif' font-size='27' font-weight='600'>
        <tspan x='120' dy='0'>${safe(line1)}</tspan>
        ${line2 ? `<tspan x='120' dy='32'>${safe(line2)}</tspan>` : ""}
      </text>
      <line x1='90' y1='196' x2='150' y2='196' stroke='${ink}' stroke-opacity='0.5'/>
      <text x='120' y='312' text-anchor='middle' fill='${ink}' fill-opacity='0.78' font-family='Geist, sans-serif' font-size='11.5' letter-spacing='1.5'>${safe(author.toUpperCase())}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function adaptBook(book: Book): ShelfBook {
  const palette =
    parseSpineColors(book.spineColors) ?? PALETTES[paletteForBook(book.id)];
  const author = book.authors?.[0] ?? "Unknown";
  const coverUrl = getBookCoverUrl(book.coverPath);

  return {
    id: book.id,
    title: book.title,
    authors: book.authors ?? [],
    year: book.publishYear ?? undefined,
    status: book.status,
    rating: book.rating ? parseFloat(book.rating) : 0,
    added: book.createdAt.getTime(),
    pages: hashJitter(book.id, 250, 750),
    cover: coverUrl ?? makeCover(book.title, author, palette),
    spine: palette,
  };
}

export function sortBooks(list: ShelfBook[], key: SortKey, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  const val = (b: ShelfBook) => {
    if (key === "title") return b.title.toLowerCase();
    if (key === "author")
      return (b.authors[0] || "").split(" ").slice(-1)[0].toLowerCase();
    if (key === "rating") return b.rating || 0;
    return b.added;
  };

  return [...list].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    if (va < vb) return -1 * mul;
    if (va > vb) return 1 * mul;
    return 0;
  });
}

export function packShelvesFill(books: ShelfBook[], maxW: number, gap: number) {
  const rows: ShelfBook[][] = [];
  let cur: ShelfBook[] = [];
  let cw = 0;

  for (const b of books) {
    const sw = spineWidth(b);
    if (cur.length && cw + gap + sw > maxW) {
      rows.push(cur);
      cur = [];
      cw = 0;
    }
    cur.push(b);
    cw += (cur.length > 1 ? gap : 0) + sw;
  }

  if (cur.length) rows.push(cur);
  return rows;
}
