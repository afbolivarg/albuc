# Albuc organic GTM

Andrés has two inputs. Everything else is automated.

## 1. Drop a book

Put an `.epub` here:

```
content/inbox/
```

Then run:

```bash
bun run content:run
```

Or leave a watcher up: `bun run content:watch`

A demo book is included. This drops and processes it:

```bash
bun run content:run -- --fixture
```

## 2. Approve the pack

Open the review file the pipeline prints, usually:

```
content/books/<slug>/REVIEW.md
```

Approve (this also runs the publish dry-run):

```bash
bun run content:approve <slug>
```

Request changes (regenerates a new DRAFT):

```bash
bun run content:changes <slug> "punchier hook"
```

Publish never runs unless the gate is `APPROVED`. Dry-run writes files under `content/books/<slug>/out/` and does not call social APIs.

## What you get from one book

| Output | Where |
| --- | --- |
| X thread | `content/books/<slug>/packs/x-thread.md` |
| IG/FB carousel | `content/books/<slug>/packs/carousel/` |
| Pinterest 2:3 | `content/books/<slug>/packs/pinterest/infographic.svg` |
| 9:16 short — VO + B-roll + captions | `content/books/<slug>/packs/short/vo-script.md`, `broll.md`, `captions.vtt` |
| 16:9 YouTube — VO + B-roll | `content/books/<slug>/packs/youtube/vo-script.md`, `broll.md` |

After approve, the same files are copied to `content/books/<slug>/out/`. Fair-use receipts (short quotes, book + author) live in `publish.json`.

## Status

```bash
bun run content:status
bun run content:publish <slug>
```

`content:publish` is blocked until `content:approve` has flipped `content/books/<slug>/gate.json` to `APPROVED`.

## Isolation

This tree is standalone. It is not an npm workspace package. It is excluded from the Next.js `tsconfig` and Biome, so Vercel / the web app / iOS are untouched. There is no GitHub Action and no husky hook.
