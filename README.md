# Cozy Books

A personal library + notes web app that unifies a beautiful cover-based bookshelf with a first-class Markdown note-taking experience. Data comes from Open Library. Authentication is Google only.

## Features

- 🔍 **Book Search** - Search any book from Open Library with rich metadata
- 📚 **Personal Library** - Beautiful cover-based grid view of your books
- 📖 **Status Tracking** - Want, Owned, Reading, Read with 0.5-increment ratings
- ✍️ **Rich Notes** - Write beautiful notes in Markdown with live preview
- 🎨 **Cozy Design** - Warm, tactile UI with serif typography and wood-like palette
- 🔐 **Google Auth** - Simple authentication with Supabase

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth (Google OAuth)
- **Typography**: EB Garamond serif font
- **Book Data**: Open Library API

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd library-app
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/cozy_books"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # Optional
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Enable Google Auth in Authentication > Providers
   - Add your domain to Authentication > URL Configuration
   - Copy your project URL and anon key to `.env.local`

4. **Set up Database**

   ```bash
   pnpm db:push
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

6. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add your Supabase callback URL to authorized redirect URIs
   - Add the Google client ID/secret to your Supabase project

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions
│   ├── auth/            # Auth callback
│   ├── library/         # Library pages
│   └── page.tsx         # Landing page
├── components/
│   ├── book-detail/     # Book detail components
│   ├── library/         # Library grid components
│   └── ui/              # Base UI components
├── lib/
│   ├── auth/            # Auth utilities
│   ├── db/              # Database config & queries
│   └── supabase/        # Supabase clients
└── middleware.ts        # Auth middleware
```

## Features Implemented

- ✅ Google authentication with Supabase
- ✅ Database schema for users and books
- ✅ Beautiful landing page with cozy design
- ✅ Library grid with book cards
- ✅ Book search using Open Library API
- ✅ Add books to library with status and rating
- ✅ Book detail pages with clickable cards
- ✅ Status management (Want/Owned/Reading/Read)
- ✅ Star rating system (0-5 with 0.5 increments)
- ✅ Markdown notes with live preview
- ✅ Cozy design with warm colors and EB Garamond font
- ✅ Responsive design for mobile and desktop

## Design System

**Colors (Cozy Books Palette)**

- Canvas: `#FAF6EF` (warm off-white)
- Panel: `#F1E8D9` (light wood)
- Primary Text: `#2B2621` (dark brown)
- Muted Text: `#6C6257` (medium brown)
- Accent: `#8B5E34` (rich brown)
- Accent Dark: `#6F4521` (darker brown)

**Typography**

- Primary: EB Garamond (serif for headings and notes)
- Secondary: Geist Sans (for UI elements)

## Contributing

This is a personal project following the PRD specifications. Feel free to explore the code and suggest improvements!

## License

MIT
