import { makeQuote, wordCount, words } from "./fair-use";
import type { Chapter, FairUseQuote, IngestedBook, Learning } from "./types";

const INSIGHT =
  /\b(because|rather|instead|remember|keep|write|ask|one|not|think|note|idea|library|read|sentence|highlight|shelf)\b/i;

const FRONT_MATTER =
  /\b(acclaim|praise|contents|copyright|dedication|acknowledgment|about the author|endnotes?|disclosures?|title page|foreword|table of contents)\b/i;

const STOP = new Set([
  "prefer",
  "from",
  "later",
  "method",
  "chapters",
  "chapter",
  "beats",
  "real",
  "jacket",
  "acclaim",
  "intro",
  "introduction",
  "memoir",
  "blurbs",
  "blurb",
  "front",
  "matter",
  "that",
  "this",
  "with",
  "have",
  "your",
  "please",
  "revise",
  "skip",
  "avoid",
  "instead",
  "about",
  "into",
  "than",
  "when",
  "notes",
]);

export type ExtractBias = {
  prefer: string[];
  skipFrontMatter: boolean;
  skipIntro: boolean;
};

export function parseExtractBias(notes: string): ExtractBias | null {
  const trimmed = notes.trim();
  if (!trimmed) return null;
  const lower = normalize(trimmed);
  const skipFrontMatter =
    /\b(acclaim|jacket|front matter|front-matter|blurb|praise)\b/.test(lower);
  const skipIntro =
    /\bintro(duction)?\b/.test(lower) &&
    /\b(memoir|blurb|skip|not|avoid|jacket|acclaim)\b/.test(lower);

  const prefer = new Set<string>();
  if (/\bvalidated learning\b/.test(lower)) prefer.add("validated learning");
  if (/\bbuild measure learn\b/.test(lower) || /\bbml\b/.test(lower)) {
    prefer.add("build measure learn");
  }
  if (/\bminimum viable product\b/.test(lower) || /\bmvp\b/.test(lower)) {
    prefer.add("minimum viable product");
    prefer.add("mvp");
  }
  if (/\bpivot\b/.test(lower)) prefer.add("pivot");

  for (const token of lower.split(" ")) {
    if (token.length < 5 || STOP.has(token) || /^\d+$/.test(token)) continue;
    prefer.add(token);
  }

  if (prefer.size === 0 && !skipFrontMatter && !skipIntro) return null;
  return { prefer: [...prefer], skipFrontMatter, skipIntro };
}

export function shouldSkipChapter(
  chapter: Chapter,
  bias: ExtractBias | null,
): boolean {
  if (!bias) return false;
  const title = chapter.title.replace(/\s+/g, " ").trim();
  const n = wordCount(chapter.text);
  if (bias.skipFrontMatter) {
    if (FRONT_MATTER.test(title)) return true;
    if (/^chapter\s+\d+$/i.test(title)) return true;
    if (/^part\s+/i.test(title) && n < 80) return true;
  }
  if (bias.skipIntro && /^introduction$/i.test(title)) return true;
  return false;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[—–-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function noteHits(text: string, bias: ExtractBias | null): number {
  if (!bias?.prefer.length) return 0;
  const hay = normalize(text);
  let hits = 0;
  for (const term of bias.prefer) {
    if (hay.includes(term)) hits += 1;
  }
  return hits;
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20);
}

function scoreSentence(
  sentence: string,
  bias: ExtractBias | null = null,
  chapter?: Chapter,
): number {
  const n = wordCount(sentence);
  let score = 0;
  if (n >= 10 && n <= 32) score += 4;
  else if (n >= 8 && n <= 40) score += 2;
  if (INSIGHT.test(sentence)) score += bias ? 1 : 3;
  if (/^[A-Z]/.test(sentence)) score += 1;
  if (/\b(I |you |your |we )\b/i.test(sentence)) score += 1;
  if (/^chapter\b/i.test(sentence)) score -= 5;
  if (n < 6 || n > 50) score -= 4;

  const hits = noteHits(sentence, bias);
  if (hits) score += 10 + hits * 5;
  if (chapter && bias) score += chapterBoost(chapter, bias);
  if (bias && /read this book/i.test(sentence)) score -= 12;
  if (bias && FRONT_MATTER.test(chapter?.title ?? "")) score -= 12;
  return score;
}

function chapterBoost(chapter: Chapter, bias: ExtractBias): number {
  const titleHits = noteHits(chapter.title, bias);
  if (titleHits) return 8 + titleHits * 2;
  const headHits = noteHits(chapter.text.slice(0, 800), bias);
  if (headHits) return Math.min(6, 2 + headHits);
  return 0;
}

const TERM_FAMILIES: { id: string; terms: string[] }[] = [
  { id: "validated-learning", terms: ["validated learning"] },
  { id: "bml", terms: ["build measure learn"] },
  { id: "pivot", terms: ["pivot"] },
  { id: "mvp", terms: ["minimum viable product", "mvp"] },
];

function familiesIn(text: string, bias: ExtractBias | null): string[] {
  if (!bias) return [];
  const hay = normalize(text);
  return TERM_FAMILIES.filter((family) =>
    family.terms.some((term) => bias.prefer.includes(term) && hay.includes(term)),
  ).map((family) => family.id);
}

function wantedFamilies(bias: ExtractBias | null): string[] {
  if (!bias) return [];
  return TERM_FAMILIES.filter((family) =>
    family.terms.some((term) => bias.prefer.includes(term)),
  ).map((family) => family.id);
}

function uniqueEnough(next: string, taken: string[]): boolean {
  const head = words(next).slice(0, 6).join(" ").toLowerCase();
  return !taken.some(
    (item) => words(item).slice(0, 6).join(" ").toLowerCase() === head,
  );
}

export function extractLearnings(
  book: IngestedBook,
  changeNotes = "",
): Learning[] {
  const bias = parseExtractBias(changeNotes);
  const learnings = collectLearnings(book, bias);
  if (learnings.length >= 3) return learnings;
  if (!bias) {
    throw new Error("Could not extract enough learnings from this EPUB");
  }
  const fallback = collectLearnings(book, {
    ...bias,
    skipFrontMatter: false,
    skipIntro: false,
  });
  if (fallback.length < 3) {
    throw new Error("Could not extract enough learnings from this EPUB");
  }
  return fallback;
}

function collectLearnings(
  book: IngestedBook,
  bias: ExtractBias | null,
): Learning[] {
  const candidates: { sentence: string; chapter: Chapter; score: number }[] =
    [];
  for (const chapter of book.chapters) {
    if (shouldSkipChapter(chapter, bias)) continue;
    for (const sentence of sentences(chapter.text)) {
      const hits = noteHits(sentence, bias);
      const score = scoreSentence(sentence, bias, chapter);
      if (score < 3 && hits === 0) continue;
      candidates.push({ sentence, chapter, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const taken: string[] = [];
  const usedQuotes = new Set<string>();
  const picked: { sentence: string; chapter: Chapter }[] = [];
  const covered = new Set<string>();
  const take = (candidate: { sentence: string; chapter: Chapter }) => {
    if (picked.length >= 8) return false;
    if (!uniqueEnough(candidate.sentence, taken)) return false;
    taken.push(candidate.sentence);
    picked.push(candidate);
    for (const family of familiesIn(candidate.sentence, bias)) covered.add(family);
    return true;
  };

  for (const family of wantedFamilies(bias)) {
    if (covered.has(family)) continue;
    const best = candidates.find((candidate) =>
      familiesIn(candidate.sentence, bias).includes(family),
    );
    if (best) take(best);
  }
  for (const candidate of candidates) {
    if (picked.length >= 8) break;
    take(candidate);
  }

  return picked.map((candidate, index) => {
    const quote = pickQuote(
      candidate.chapter,
      book.meta.title,
      book.meta.author,
      usedQuotes,
      bias,
    );
    if (quote) usedQuotes.add(quote.text);
    return {
      id: `L${String(index + 1).padStart(2, "0")}`,
      claim: tidyClaim(candidate.sentence),
      whyItMatters: whyItMatters(candidate.sentence, candidate.chapter.title),
      chapter: candidate.chapter.title,
      quote,
    };
  });
}

export function collectQuotes(
  book: IngestedBook,
  learnings: Learning[],
  changeNotes = "",
): FairUseQuote[] {
  const bias = parseExtractBias(changeNotes);
  const quotes: FairUseQuote[] = [];
  const seen = new Set<string>();
  for (const learning of learnings) {
    if (!learning.quote || seen.has(learning.quote.text)) continue;
    seen.add(learning.quote.text);
    quotes.push(learning.quote);
  }
  for (const chapter of book.chapters) {
    if (quotes.length >= 6) break;
    if (shouldSkipChapter(chapter, bias)) continue;
    const extra = pickQuote(
      chapter,
      book.meta.title,
      book.meta.author,
      seen,
      bias,
    );
    if (!extra) continue;
    seen.add(extra.text);
    quotes.push(extra);
  }
  return quotes.slice(0, 6);
}

function pickQuote(
  chapter: Chapter,
  title: string,
  author: string,
  used: Set<string> = new Set(),
  bias: ExtractBias | null = null,
): FairUseQuote | null {
  const maxWords = bias ? 40 : 25;
  const options = sentences(chapter.text)
    .filter((sentence) => {
      const n = wordCount(sentence);
      if (n < 8 || n > maxWords) return false;
      if (used.has(clipForCompare(sentence))) return false;
      if (bias && noteHits(sentence, bias) > 0) return true;
      return INSIGHT.test(sentence);
    })
    .sort(
      (a, b) =>
        scoreSentence(b, bias, chapter) - scoreSentence(a, bias, chapter),
    );
  const best = options[0];
  if (!best) return null;
  return makeQuote(
    best,
    title,
    author,
    chapter.title,
    "Short attributed excerpt for social teaching, fair-use commentary.",
  );
}

function clipForCompare(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function tidyClaim(sentence: string): string {
  return sentence.replace(/\s+/g, " ").replace(/[.]+$/, "").trim();
}

function whyItMatters(sentence: string, chapter: string): string {
  const lower = sentence.toLowerCase();
  if (lower.includes("highlight")) {
    return "Highlights feel like work done; they usually are not.";
  }
  if (lower.includes("note") || lower.includes("write")) {
    return "Writing is the cheapest way to keep a book after you close it.";
  }
  if (lower.includes("ask") || lower.includes("library")) {
    return "A shelf you can query is worth more than a shelf you can display.";
  }
  if (lower.includes("one") || lower.includes("sentence")) {
    return "One kept sentence beats a notebook of leftovers.";
  }
  if (lower.includes("validated learning") || /build.measure.learn/i.test(sentence)) {
    return "Progress is what you can prove on the next turn of the loop.";
  }
  if (/\bpivot\b/i.test(sentence)) {
    return "A structured turn beats staying wrong with more effort.";
  }
  if (lower.includes("minimum viable") || /\bmvp\b/i.test(sentence)) {
    return "Ship the smallest thing that can teach you.";
  }
  return `A usable takeaway from “${chapter}.”`;
}
