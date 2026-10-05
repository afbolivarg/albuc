# Albuc

Your personal library and book notes, with AI-powered Q&A over your notes.

**Free to use at [albuc.com](https://albuc.com)**

## Features

- **Library** — Add books (Open Library search), track status, rate, and write notes
- **Notes** — Markdown notes per book; automatically chunked and embedded
- **Ask** — Chat with your library; answers grounded in your notes

## License

MIT. See [LICENSE](LICENSE).

## Local development

```bash
bun install
cp .env.example .env.local   # fill in values
bun run db:migrate
bun dev
```

Schema changes: `bun run db:generate` → review SQL in `src/lib/db/migrations/` → `bun run db:migrate`

Lint and format: `bun run lint` · `bun run format` · `bun run check` (lint + format + fix)

## Monorepo

The web app lives at the repo root (`src/`). Shared domain rules (statuses, ratings, handles, cover URLs, and Ask limits) live in `packages/domain` as `@albuc/domain`.

The native iOS app is work in progress and lives on the [`ios-wip`](https://github.com/afbolivarg/albuc/tree/ios-wip) branch.
