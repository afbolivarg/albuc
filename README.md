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

Schema changes: `bun run db:generate` → review SQL in `drizzle/` → `bun run db:migrate`

Lint and format: `bun run lint` · `bun run format` · `bun run check` (lint + format + fix)
