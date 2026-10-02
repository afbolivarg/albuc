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

One repo for the web app, the native iOS app, and the shared domain rules.

- `src/` — Next.js web app (library, notes, Ask, and the `/api/v1` API the phone uses)
- `packages/domain` — shared statuses, ratings, handles, cover URLs, and limits (`@albuc/domain`)
- `apps/ios` — SwiftUI app. UIKit and SwiftUI only. No React Native or shared UI.

The phone does not reimplement search, notes, embeddings, or Ask. It calls the same server.

## iOS

Open `apps/ios/Albuc.xcodeproj` in Xcode 16 or later, pick an iPhone simulator, and run. The app talks to `https://albuc.com` unless you change `AlbucAPIBaseURL` in `apps/ios/Albuc/Info.plist`.

Sign in with the same email you use on the web. When the message arrives, paste the link into the app, or tap it on the phone if the redirect opens Albuc. In the Supabase Auth redirect allow list, add `https://albuc.com/auth/app` and `albuc://auth/callback` so the button in the email opens the app directly.

The first launch needs a signing team under the Albuc target. Simulator runs do not need a paid developer account.
