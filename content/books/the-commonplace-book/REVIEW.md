# Review pack — The Commonplace Book

**Author:** A. Reader  
**Slug:** `the-commonplace-book`  
**Gate:** **DRAFT**

This is the only file Andrés needs to read. Approve or request changes. Nothing publishes until the gate is APPROVED.

## How to decide

```bash
bun run content:approve the-commonplace-book
bun run content:changes the-commonplace-book "what to fix"
```

## Hook

You don't have a reading problem. You have a keeping problem.

Five keepable ideas from The Commonplace Book by A. Reader — then a practice you can do tonight.

## Learnings

- **L01** (The leak) — The ideas leaked because nothing in the week asked you to use them
- **L02** (The leak) — If you cannot say it, you did not keep it
- **L03** (The leak) — Remember this: the book is not finished when you close it
- **L04** (Highlights are not thinking) — Rather than paint the page yellow, write the idea in your own words
- **L05** (Highlights are not thinking) — If you cannot write it, you do not own it yet
- **L06** (Highlights are not thinking) — Ask of every mark: would I teach this to a friend at a table?
- **L07** (One sentence that survives) — Write the sentence as if you had to send it in a letter
- **L08** (One sentence that survives) — Name the idea that changed what you will do tomorrow

## Fair-use quotes (short, attributed)

- “The ideas leaked because nothing in the week asked you to use them.” — The Commonplace Book, A. Reader · The leak · 13 words
- “If you cannot say it, you did not keep it.” — The Commonplace Book, A. Reader · The leak · 10 words
- “Remember this: the book is not finished when you close it.” — The Commonplace Book, A. Reader · The leak · 11 words
- “Rather than paint the page yellow, write the idea in your own words.” — The Commonplace Book, A. Reader · Highlights are not thinking · 13 words
- “If you cannot write it, you do not own it yet.” — The Commonplace Book, A. Reader · Highlights are not thinking · 11 words
- “Ask of every mark: would I teach this to a friend at a table?” — The Commonplace Book, A. Reader · Highlights are not thinking · 14 words

## Packs

| Platform | Path |
| --- | --- |
| X thread | `packs/x-thread.md` |
| IG/FB carousel | `packs/carousel/carousel.md` + `slide-*.svg` |
| Pinterest 2:3 | `packs/pinterest/infographic.svg` |
| 9:16 short (VO + B-roll + captions) | `packs/short/vo-script.md`, `broll.md`, `captions.vtt` |
| 16:9 YouTube (VO + B-roll) | `packs/youtube/vo-script.md`, `broll.md` |

Shorts are a spoken voiceover with picture B-roll and a `.vtt` caption file — not talking-head text cards.

## After approve

Dry-run publish writes files under `out/` and never calls a social API. Live publishers are stubs behind the same `Publisher` interface.
