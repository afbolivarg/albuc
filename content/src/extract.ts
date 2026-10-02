import { makeQuote, wordCount, words } from "./fair-use";
import type { Chapter, FairUseQuote, IngestedBook, Learning } from "./types";

const INSIGHT =
  /\b(because|rather|instead|remember|keep|write|ask|one|not|think|note|idea|library|read|sentence|highlight|shelf)\b/i;

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20);
}

function scoreSentence(sentence: string): number {
  const n = wordCount(sentence);
  let score = 0;
  if (n >= 10 && n <= 32) score += 4;
  else if (n >= 8 && n <= 40) score += 2;
  if (INSIGHT.test(sentence)) score += 3;
  if (/^[A-Z]/.test(sentence)) score += 1;
  if (/\b(I |you |your |we )\b/i.test(sentence)) score += 1;
  if (/^chapter\b/i.test(sentence)) score -= 5;
  if (n < 6 || n > 50) score -= 4;
  return score;
}

function uniqueEnough(next: string, taken: string[]): boolean {
  const head = words(next).slice(0, 6).join(" ").toLowerCase();
  return !taken.some((item) =>
    words(item).slice(0, 6).join(" ").toLowerCase() === head,
  );
}

export function extractLearnings(book: IngestedBook): Learning[] {
  const candidates: { sentence: string; chapter: Chapter; score: number }[] =
    [];
  for (const chapter of book.chapters) {
    for (const sentence of sentences(chapter.text)) {
      const score = scoreSentence(sentence);
      if (score < 3) continue;
      candidates.push({ sentence, chapter, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const taken: string[] = [];
  const usedQuotes = new Set<string>();
  const learnings: Learning[] = [];
  for (const candidate of candidates) {
    if (learnings.length >= 8) break;
    if (!uniqueEnough(candidate.sentence, taken)) continue;
    taken.push(candidate.sentence);
    const quote = pickQuote(
      candidate.chapter,
      book.meta.title,
      book.meta.author,
      usedQuotes,
    );
    if (quote) usedQuotes.add(quote.text);
    learnings.push({
      id: `L${String(learnings.length + 1).padStart(2, "0")}`,
      claim: tidyClaim(candidate.sentence),
      whyItMatters: whyItMatters(candidate.sentence, candidate.chapter.title),
      chapter: candidate.chapter.title,
      quote,
    });
  }
  if (learnings.length < 3) {
    throw new Error("Could not extract enough learnings from this EPUB");
  }
  return learnings;
}

export function collectQuotes(
  book: IngestedBook,
  learnings: Learning[],
): FairUseQuote[] {
  const quotes: FairUseQuote[] = [];
  const seen = new Set<string>();
  for (const learning of learnings) {
    if (!learning.quote || seen.has(learning.quote.text)) continue;
    seen.add(learning.quote.text);
    quotes.push(learning.quote);
  }
  for (const chapter of book.chapters) {
    if (quotes.length >= 6) break;
    const extra = pickQuote(chapter, book.meta.title, book.meta.author, seen);
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
): FairUseQuote | null {
  const options = sentences(chapter.text)
    .filter((sentence) => {
      const n = wordCount(sentence);
      return n >= 8 && n <= 25 && INSIGHT.test(sentence) && !used.has(clipForCompare(sentence));
    })
    .sort((a, b) => scoreSentence(b) - scoreSentence(a));
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
  return `A usable takeaway from “${chapter}.”`;
}
