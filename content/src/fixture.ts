import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildEpub } from "./epub";
import { FIXTURES_DIR } from "./paths";

export const FIXTURE_TITLE = "The Commonplace Book";
export const FIXTURE_AUTHOR = "A. Reader";
export const FIXTURE_SLUG = "the-commonplace-book";

const chapters = [
  {
    title: "The leak",
    html: `<h1>The leak</h1>
<p>You finish a book on Sunday and by Thursday you cannot teach a single page of it. That is not a memory problem. It is a keeping problem. Reading is an event. Keeping is a practice.</p>
<p>A stack of finished spines looks like knowledge. It is often only evidence that your eyes moved. The ideas leaked because nothing in the week asked you to use them.</p>
<p>Write one sentence you can say out loud. If you cannot say it, you did not keep it. A library you cannot query is a warehouse.</p>
<p>Remember this: the book is not finished when you close it. The book is finished when one idea can survive without the page in front of you.</p>`,
  },
  {
    title: "Highlights are not thinking",
    html: `<h1>Highlights are not thinking</h1>
<p>A highlight is a receipt. It proves you paused. It does not prove you thought. Most highlights are a way to leave the sentence for later, and later never comes.</p>
<p>Rather than paint the page yellow, write the idea in your own words. If you cannot write it, you do not own it yet. Instead of collecting marks, collect one claim.</p>
<p>Keep the cheapest note that would still be useful next month. A highlight feels like work done. It usually is not.</p>
<p>Ask of every mark: would I teach this to a friend at a table? If not, let it go.</p>`,
  },
  {
    title: "One sentence that survives",
    html: `<h1>One sentence that survives</h1>
<p>One kept sentence beats a notebook of leftovers. Write the sentence as if you had to send it in a letter. Short enough to remember. Sharp enough to use.</p>
<p>Do not summarize the chapter. Name the idea that changed what you will do tomorrow. If nothing changed, the honest note is that nothing changed.</p>
<p>Keep the sentence next to the book, not buried in a file you will not open. When you return to the shelf, that line should still work.</p>
<p>Think on the page. The page is cheaper than rereading the book because you forgot why you liked it.</p>`,
  },
  {
    title: "Ask the shelf",
    html: `<h1>Ask the shelf</h1>
<p>A shelf you can query is worth more than a shelf you can display. Ask a question you actually have, then look only in your notes.</p>
<p>If the notes cannot answer, the reading was tourism. Write the missing piece, or read the chapter again with that question in your pocket.</p>
<p>Your library should talk back. Not the internet. Not a generic summary. Your words, from the books you actually held.</p>
<p>Remember to ask small questions. One book. One idea. One next step.</p>`,
  },
  {
    title: "A reading life",
    html: `<h1>A reading life</h1>
<p>A reading life is not a race through titles. It is a habit of keeping. Read less if you must. Write more of what remains.</p>
<p>Keep a commonplace book: one place where the sentences live. Date them. Attribute the book and the author. Short quotes only. The rest is your commentary.</p>
<p>When a friend asks what you are reading, answer with an idea, not a title. That is the test.</p>
<p>Build the shelf so next year's you can ask it something and get an answer. That is the whole practice.</p>`,
  },
];

export function writeFixture(): string {
  mkdirSync(FIXTURES_DIR, { recursive: true });
  const buf = buildEpub({
    title: FIXTURE_TITLE,
    author: FIXTURE_AUTHOR,
    language: "en",
    chapters,
  });
  const path = join(FIXTURES_DIR, `${FIXTURE_SLUG}.epub`);
  writeFileSync(path, buf);
  return path;
}
