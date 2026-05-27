import "dotenv/config";
import type { z } from "zod";
import { z as zod } from "zod";

/**
 * Validates process.env against a Zod schema at startup.
 * Exits the process immediately with a descriptive error if any variable is missing or invalid.
 */
function createEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  return result.data;
}

const publicSchema = zod.object({
  NEXT_PUBLIC_SITE_URL: zod
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/$/, "")),
  NEXT_PUBLIC_SUPABASE_URL: zod.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: zod.string().min(1),
});

const serverSchema = publicSchema.extend({
  NODE_ENV: zod
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: zod.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: zod.string().min(1),
  LOG_LEVEL: zod.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_PRETTY: zod.preprocess((value) => {
    if (value === undefined || value === "") {
      return process.env.NODE_ENV === "development";
    }
    return value === "true" || value === "1";
  }, zod.boolean()),
});

export const env = createEnv(serverSchema);
