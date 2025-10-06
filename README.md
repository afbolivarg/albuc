# Albuc

Your personal library, beautifully organized.

## Setup

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_supabase_database_url_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# LemonSqueezy
LEMON_SQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_SIGNING_SECRET=your_webhook_signing_secret
LEMON_SQUEEZY_VARIANT_ID_MONTHLY=your_monthly_variant_id
LEMON_SQUEEZY_VARIANT_ID_LIFETIME=your_lifetime_variant_id

# Google AI (for embeddings and chat)
# Get your API key from https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
```

### Installation

```bash
pnpm install
```

### Database Setup

Ensure the `pgvector` extension is enabled in your Supabase database:

```sql
create extension if not exists vector;
```

Then run migrations:

```bash
pnpm db:push
```

### Development

```bash
pnpm dev
```

### Embedding Pipeline

The app automatically processes note embeddings when you save notes. To verify or process existing notes:

```bash
# Verify the embedding setup is correct
pnpm embeddings:verify

# Process embeddings for all existing books with notes
pnpm embeddings:process
```

## Features

- **Personal Library Management**: Add and organize your book collection
- **AI-Powered Q&A**: Ask questions about your notes using semantic search (Stage 2 complete)
- **Subscription Plans**: Curator (monthly) and Archivist (lifetime) tiers
- **Usage Tracking**: Query limits enforced per plan
- **Automatic Embeddings**: Notes are automatically chunked and embedded for semantic search

## ⚠️ Important Notes

### Embedding Model Changes

The app uses Google's `text-embedding-004` model to generate embeddings. **If you change the embedding model**, all existing embeddings become incompatible and must be regenerated:

1. Update `EMBEDDING_MODEL` in `src/lib/ai/embedding.ts`
2. Run the database migration to update the schema
3. Re-process all notes: `pnpm embeddings:process`

**Why?** Different embedding models produce vectors in completely different semantic spaces. Even if the dimensions match, comparing vectors from different models produces meaningless results.

The `model_version` column in `note_chunks` tracks which model was used, so you can detect and migrate outdated embeddings.
