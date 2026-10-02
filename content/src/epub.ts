import { basename } from "node:path";
import { wordCount } from "./fair-use";
import type { Chapter, IngestedBook } from "./types";
import { unzip, zipStore } from "./zip";

export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || "untitled-book";
}

function xmlText(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(re);
  return match?.[1] ? decodeEntities(stripTags(match[1])).trim() : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(Number.parseInt(n, 16)),
    );
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function firstHeading(html: string, fallback: string): string {
  const match = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  if (!match?.[1]) return fallback;
  return decodeEntities(stripTags(match[1])).trim() || fallback;
}

function resolveHref(opfDir: string, href: string): string {
  const clean = href.split("#")[0] ?? href;
  if (!opfDir) return clean;
  const parts = `${opfDir}/${clean}`.split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out.join("/");
}

export function parseEpub(buf: Buffer, sourceFile: string): IngestedBook {
  const files = unzip(buf);
  const container = files.get("META-INF/container.xml")?.toString("utf8");
  if (!container) throw new Error("EPUB missing META-INF/container.xml");

  const opfHref =
    container.match(/full-path="([^"]+)"/)?.[1] ??
    [...files.keys()].find((name) => name.endsWith(".opf"));
  if (!opfHref) throw new Error("EPUB missing package document");

  const opf = files.get(opfHref)?.toString("utf8");
  if (!opf) throw new Error(`EPUB missing ${opfHref}`);

  const opfDir = opfHref.includes("/")
    ? opfHref.slice(0, opfHref.lastIndexOf("/"))
    : "";

  const title =
    xmlText(opf, "dc:title") ??
    slugify(basename(sourceFile, ".epub")).replace(/-/g, " ");
  const author = xmlText(opf, "dc:creator") ?? "Unknown author";
  const language = xmlText(opf, "dc:language") ?? "en";

  const manifest = new Map<string, string>();
  const itemRe = /<item\b([^>]+)\/>/gi;
  let itemMatch: RegExpExecArray | null = itemRe.exec(opf);
  while (itemMatch) {
    const attrs = itemMatch[1] ?? "";
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    const href = attrs.match(/\bhref="([^"]+)"/)?.[1];
    if (id && href) manifest.set(id, href);
    itemMatch = itemRe.exec(opf);
  }

  const chapters: Chapter[] = [];
  const spineRe = /<itemref\b([^>]+)\/>/gi;
  let spineMatch: RegExpExecArray | null = spineRe.exec(opf);
  let index = 0;
  while (spineMatch) {
    const attrs = spineMatch[1] ?? "";
    const idref = attrs.match(/\bidref="([^"]+)"/)?.[1];
    spineMatch = spineRe.exec(opf);
    if (!idref) continue;
    const href = manifest.get(idref);
    if (!href) continue;
    const path = resolveHref(opfDir, href);
    const raw = files.get(path)?.toString("utf8");
    if (!raw) continue;
    const text = htmlToText(raw);
    if (text.length < 40) continue;
    index += 1;
    chapters.push({
      id: idref,
      title: firstHeading(raw, `Chapter ${index}`),
      href: path,
      text,
    });
  }

  if (chapters.length === 0) {
    throw new Error("EPUB has no readable chapters in the spine");
  }

  const fullText = chapters.map((chapter) => chapter.text).join("\n\n");
  return {
    meta: {
      slug: slugify(title),
      title: title.trim(),
      author: author.trim(),
      language,
      sourceFile,
      chapterCount: chapters.length,
      wordCount: wordCount(fullText),
    },
    chapters,
    fullText,
  };
}

export function buildEpub(input: {
  title: string;
  author: string;
  language?: string;
  chapters: { title: string; html: string }[];
}): Buffer {
  const lang = input.language ?? "en";
  const navItems = input.chapters
    .map(
      (chapter, i) =>
        `<li><a href="chap${String(i + 1).padStart(2, "0")}.xhtml">${escapeXml(chapter.title)}</a></li>`,
    )
    .join("\n");

  const manifest = input.chapters
    .map(
      (_, i) =>
        `<item id="chap${i + 1}" href="chap${String(i + 1).padStart(2, "0")}.xhtml" media-type="application/xhtml+xml"/>`,
    )
    .join("\n    ");
  const spine = input.chapters
    .map((_, i) => `<itemref idref="chap${i + 1}"/>`)
    .join("\n    ");

  const chapterFiles = input.chapters.map((chapter, i) => ({
    name: `OEBPS/chap${String(i + 1).padStart(2, "0")}.xhtml`,
    data: xhtml(chapter.title, chapter.html),
  }));

  return zipStore([
    { name: "mimetype", data: "application/epub+zip" },
    {
      name: "META-INF/container.xml",
      data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
    },
    {
      name: "OEBPS/content.opf",
      data: `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:albuc:fixture:${slugify(input.title)}</dc:identifier>
    <dc:title>${escapeXml(input.title)}</dc:title>
    <dc:creator>${escapeXml(input.author)}</dc:creator>
    <dc:language>${escapeXml(lang)}</dc:language>
    <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${manifest}
  </manifest>
  <spine>
    <itemref idref="nav" linear="no"/>
    ${spine}
  </spine>
</package>
`,
    },
    {
      name: "OEBPS/nav.xhtml",
      data: xhtml(
        "Contents",
        `<h1>Contents</h1><ol>${navItems}</ol>`,
      ),
    },
    ...chapterFiles,
  ]);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xhtml(title: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head><meta charset="utf-8"/><title>${escapeXml(title)}</title></head>
<body>
${body}
</body>
</html>
`;
}
