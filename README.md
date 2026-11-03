# Albuc

Your personal library and book notes, with AI-powered Q&A over your notes.

**Free to use at [albuc.com](https://albuc.com)**

## Who it's for

Readers who want to keep a personal library and search and ask questions over their own book notes.

## Features

- **Library** — Add books (Open Library search), track status, rate, and write notes
- **Notes** — Markdown notes per book; automatically chunked and embedded
- **Ask** — Chat with your library; answers grounded in your notes

## Built with

- **Next.js** (App Router) and **React**
- **TypeScript**
- **Tailwind CSS** and **shadcn/ui**
- **Drizzle ORM** with **Postgres** on **Neon**
- **Vercel AI SDK** with **Google Gemini**
- **Resend** for transactional email
- **Bun** as the runtime and package manager
- Deployed on **Vercel**

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values below.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Public base URL of the app. Defaults to `http://localhost:3000`; set to the production URL in deployment. |
| `NEXT_PUBLIC_COVERS_URL` | No | Public base URL where book cover images are served from. Leave empty to disable remote cover URLs. |
| `DATABASE_URL` | Yes | Postgres connection string (Neon in production). |
| `AUTH_SECRET` | Yes | Secret used to sign and verify magic-link sessions. |
| `RESEND_API_KEY` | Yes | Resend API key for sending sign-in (magic-link) emails. |
| `R2_ACCOUNT_ID` | No | Cloudflare R2 account ID for cover storage. |
| `R2_ACCESS_KEY_ID` | No | R2 access key ID for cover storage. |
| `R2_SECRET_ACCESS_KEY` | No | R2 secret access key for cover storage. |
| `R2_BUCKET` | No | R2 bucket name for covers. Defaults to `albuc-covers`. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Google Generative AI (Gemini) API key used for embeddings and chat. |
| `OPENAI_API_KEY` | No | Optional OpenAI API key. |
| `LOG_LEVEL` | No | Log verbosity: `debug`, `info`, `warn`, or `error`. Defaults to `info`. |
| `LOG_PRETTY` | No | Pretty-print logs when `true`/`1`. Defaults to on in development. |

## License

MIT. See [LICENSE](LICENSE).

## Acknowledgements

Third-party code and credits are listed in [NOTICE.md](NOTICE.md).

## Local development

```bash
bun install
cp .env.example .env.local   # fill in values
bun run db:migrate
bun dev
```

Schema changes: `bun run db:generate` → review SQL in `src/lib/db/migrations/` → `bun run db:migrate`

Lint and format: `bun run lint` · `bun run format` · `bun run check` (lint + format + fix)
