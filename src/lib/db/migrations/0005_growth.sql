CREATE TYPE "note_visibility" AS ENUM('private', 'public');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "public_profile" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_handle_unique" ON "users" ("handle");--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "visibility" "note_visibility" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "share_slug" text;--> statement-breakpoint
CREATE UNIQUE INDEX "books_share_slug_unique" ON "books" ("share_slug");
