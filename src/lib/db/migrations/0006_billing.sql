ALTER TABLE "users" ADD COLUMN "billing_exempt" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "creem_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "creem_subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_creem_customer_id_unique" ON "users" ("creem_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_creem_subscription_id_unique" ON "users" ("creem_subscription_id");--> statement-breakpoint
UPDATE "users" SET "billing_exempt" = true;
