# Albuc

Your personal library and book notes, with AI-powered Q&A over your notes. Free and open source.

## Quick start

```bash
git clone https://github.com/afbolivarg/albuc.git
cd albuc
pnpm install
pnpm setup    # interactive: prompts for env vars and writes .env.local
pnpm db:push  # after Supabase + pgvector are ready
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, add books and notes, then use **Ask** to chat with your library.

## Environment variables

The easiest way is **`pnpm setup`**, which writes `.env.local` for you. You can also copy `.env.example` and fill in values.

| Variable                        | Description                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | App URL (e.g. `http://localhost:3000` or your Vercel URL)                          |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                                                                  |
| `DATABASE_URL`                  | Supabase database connection string (for Drizzle)                                  |
| `AI_PROVIDER`                   | `google` \| `openai` \| `anthropic` (chat)                                         |
| `AI_CHAT_MODEL`                 | Optional; defaults: `gemini-2.0-flash-exp`, `gpt-4o`, `claude-3-5-sonnet-20241022` |
| `AI_EMBEDDING_PROVIDER`         | `google` \| `openai` (default: `google`)                                           |
| `AI_EMBEDDING_MODEL`            | Optional; defaults: `text-embedding-004`, `text-embedding-3-small`                 |
| `GOOGLE_GENERATIVE_AI_API_KEY`  | For Google chat/embeddings ([get key](https://aistudio.google.com/app/apikey))     |
| `OPENAI_API_KEY`                | For OpenAI chat/embeddings                                                         |
| `ANTHROPIC_API_KEY`             | For Anthropic chat                                                                 |

## Supabase backend

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication → Providers**, enable **Email** (and optionally disable email confirmation for local dev).
3. In **Project Settings → API**: copy **Project URL** and **anon public** key into your env.
4. In **Project Settings → Database**: copy the **Connection string** (URI) for `DATABASE_URL`.
5. In the SQL editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
6. For production, set **Authentication → URL Configuration → Site URL** to your app URL (e.g. `https://your-app.vercel.app`), and add `https://your-app.vercel.app/**` to **Redirect URLs** if needed. For password reset, add `https://your-app.vercel.app/update-password` (or your custom URL).

## Deploy on Vercel

1. Push your repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add all env vars from `.env.example` in **Settings → Environment Variables** (use your production Supabase and AI keys).
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`).
4. Deploy. After deploy, set the same `NEXT_PUBLIC_SITE_URL` in Supabase **Authentication → URL Configuration**.

Using the CLI:

```bash
npm i -g vercel
vercel
# Follow prompts, then add env vars in Vercel dashboard or via vercel env add
```

## Scripts

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `pnpm dev`                | Start dev server                              |
| `pnpm build`              | Production build                              |
| `pnpm setup`              | Interactive env setup (writes `.env.local`)   |
| `pnpm db:push`            | Push schema to DB (Drizzle)                   |
| `pnpm db:studio`          | Open Drizzle Studio                           |
| `pnpm embeddings:verify`  | Check embedding pipeline config               |
| `pnpm embeddings:process` | Generate embeddings for all existing notes    |
| `pnpm test:ai-query`      | Run a quick AI Q&A test (requires DB + notes) |

## Features

- **Library**: Add books (Open Library search), track status, rate, and write notes.
- **Notes**: Markdown notes per book; automatically chunked and embedded.
- **Ask**: Chat with your library; answers are grounded in your notes (semantic search + AI).
- **Auth**: Email/password (Supabase); sign up, sign in, forgot password, update password.

## Embedding model

Embeddings are used for semantic search over your notes. Default is Google `text-embedding-004` (768 dimensions). If you change `AI_EMBEDDING_PROVIDER` or `AI_EMBEDDING_MODEL`, you must re-run:

```bash
pnpm embeddings:process
```

Different models produce incompatible vectors; the app tracks `model_version` per chunk.

## License

MIT. See [LICENSE](LICENSE). This project is provided as-is, without warranty. Use and modify as you like.
