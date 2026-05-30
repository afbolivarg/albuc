ALTER TABLE "note_chunks" ALTER COLUMN "model_version" SET DEFAULT 'gemini-embedding-001';--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "cover_path" text;