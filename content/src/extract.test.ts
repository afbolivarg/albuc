import { describe, expect, test } from "bun:test";
import {
  extractLearnings,
  parseExtractBias,
  shouldSkipChapter,
} from "./extract";
import type { IngestedBook } from "./types";

const NOTES =
  "Prefer validated learning, Build-Measure-Learn, pivot, and real MVP beats from later method chapters — not jacket acclaim or intro memoir blurbs.";

const book: IngestedBook = {
  meta: {
    slug: "demo",
    title: "Demo",
    author: "A. Author",
    language: "en",
    sourceFile: "demo.epub",
    chapterCount: 4,
    wordCount: 200,
  },
  chapters: [
    {
      id: "acclaim",
      title: "Acclaim for THE LEAN STARTUP",
      href: "acclaim",
      text: "If you are thinking about becoming an entrepreneur, read this book. If you are just curious about entrepreneurship, read this book. A revolutionary method will help bring your idea to a successful and sustainable end.",
    },
    {
      id: "intro",
      title: "Introduction",
      href: "intro",
      text: "I particularly remember a moment from back then: the moment I realized my company was going to fail. We tried desperately to raise more capital, and we could not.",
    },
    {
      id: "learn",
      title: "3LEARN",
      href: "learn",
      text: "Validated learning is the process of demonstrating empirically that a team has discovered valuable truths about a startup. Instead of making complex plans, you steer with the Build-Measure-Learn feedback loop.",
    },
    {
      id: "pivot",
      title: "8PIVOT (OR PERSEVERE)",
      href: "pivot",
      text: "That change is called a pivot: a structured course correction designed to test a new fundamental hypothesis. A minimum viable product enables a full turn of the loop with the least effort.",
    },
  ],
  fullText: "",
};

describe("extract bias", () => {
  test("parses method notes and skip flags", () => {
    const bias = parseExtractBias(NOTES);
    expect(bias?.skipFrontMatter).toBe(true);
    expect(bias?.skipIntro).toBe(true);
    expect(bias?.prefer).toContain("validated learning");
    expect(bias?.prefer).toContain("pivot");
    expect(bias?.prefer).toContain("mvp");
  });

  test("skips acclaim and introduction when notes ask", () => {
    const bias = parseExtractBias(NOTES);
    expect(shouldSkipChapter(book.chapters[0]!, bias)).toBe(true);
    expect(shouldSkipChapter(book.chapters[1]!, bias)).toBe(true);
    expect(shouldSkipChapter(book.chapters[2]!, bias)).toBe(false);
  });

  test("method notes demote jacket copy and keep BML/pivot/MVP", () => {
    const learnings = extractLearnings(book, NOTES);
    expect(learnings.length).toBeGreaterThanOrEqual(3);
    expect(learnings[0]?.chapter).not.toMatch(/acclaim|introduction/i);
    const blob = learnings.map((item) => item.claim).join(" ").toLowerCase();
    expect(blob).toMatch(/validated learning/);
    expect(blob).toMatch(/build-measure-learn|build, measure, learn/);
    expect(blob).toMatch(/pivot/);
    expect(blob).toMatch(/minimum viable product|mvp/);
    expect(blob).not.toMatch(/read this book/);
  });

  test("no notes still extracts from early chapters", () => {
    const learnings = extractLearnings(book, "");
    expect(learnings.length).toBeGreaterThanOrEqual(3);
  });
});
