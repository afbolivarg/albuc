CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."book_status" AS ENUM('WANT', 'OWNED', 'READING', 'READ');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"work_key" text NOT NULL,
	"edition_key" text,
	"title" text NOT NULL,
	"authors" text[],
	"author_keys" text[],
	"publish_year" integer,
	"cover_id" integer,
	"isbn_10" text[],
	"isbn_13" text[],
	"status" "book_status" NOT NULL,
	"rating" numeric(2, 1),
	"note_markdown" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"chunk" text NOT NULL,
	"embedding" vector(768) NOT NULL,
	"model_version" text DEFAULT 'text-embedding-004' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" text NOT NULL,
	"queries_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_sub" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_sub_unique" UNIQUE("google_sub")
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_chunks" ADD CONSTRAINT "note_chunks_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_books_user_id_idx" ON "books" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_books_status_idx" ON "books" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_books_updated_at_idx" ON "books" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "note_chunks_book_id_idx" ON "note_chunks" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "note_chunks_embedding_idx" ON "note_chunks" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "usage_counters_user_id_idx" ON "usage_counters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_counters_month_idx" ON "usage_counters" USING btree ("month");--> statement-breakpoint
CREATE INDEX "usage_counters_user_month_idx" ON "usage_counters" USING btree ("user_id","month");