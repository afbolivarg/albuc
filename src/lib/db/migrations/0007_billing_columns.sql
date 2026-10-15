ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "billing_exempt" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "creem_customer_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "creem_subscription_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" text DEFAULT 'none' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_period_start" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_period_end" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_cancel_at_period_end" boolean DEFAULT false NOT NULL;
