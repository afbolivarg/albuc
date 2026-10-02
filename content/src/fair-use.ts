import type { FairUseQuote } from "./types";

export const MAX_QUOTE_WORDS = 25;

export function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function clipQuote(text: string, max = MAX_QUOTE_WORDS): string {
  const list = words(text.replace(/\s+/g, " ").trim());
  if (list.length <= max) return list.join(" ");
  return `${list.slice(0, max).join(" ")}…`;
}

export function attribution(title: string, author: string): string {
  return `— ${title}, ${author}`;
}

export function makeQuote(
  raw: string,
  title: string,
  author: string,
  location: string,
  purpose: string,
): FairUseQuote {
  const text = clipQuote(raw);
  const count = wordCount(text.replace(/…$/, ""));
  if (count > MAX_QUOTE_WORDS) {
    throw new Error(
      `Fair-use quote exceeds ${MAX_QUOTE_WORDS} words (${count}): ${text}`,
    );
  }
  return {
    text,
    wordCount: wordCount(text),
    attribution: attribution(title, author),
    location,
    purpose,
  };
}

export function assertQuotes(quotes: FairUseQuote[]) {
  for (const quote of quotes) {
    if (quote.wordCount > MAX_QUOTE_WORDS) {
      throw new Error(
        `Quote at ${quote.location} is ${quote.wordCount} words (max ${MAX_QUOTE_WORDS})`,
      );
    }
    if (!quote.attribution.includes("—")) {
      throw new Error(`Quote missing attribution: ${quote.text}`);
    }
  }
}
