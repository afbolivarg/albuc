import { z } from "zod";

/**
 * Centralized environment validation.
 *
 * - Public vars (NEXT_PUBLIC_*) are validated and exposed everywhere.
 * - Server-only vars are validated only on the server. Accessing them from
 *   client code throws at runtime instead of silently returning undefined.
 *
 * Run db scripts with `bun run` so Bun loads `.env` / `.env.local` automatically.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/$/, "")),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_PRETTY: z.preprocess((value) => {
    if (value === undefined || value === "") {
      return process.env.NODE_ENV === "development";
    }
    return value === "true" || value === "1";
  }, z.boolean()),
});

type PublicEnv = z.infer<typeof publicSchema>;
type ServerEnv = z.infer<typeof serverSchema>;
export type Env = PublicEnv & ServerEnv;

const isServer = typeof window === "undefined";

/**
 * Explicit runtime values so Next.js can statically replace
 * `process.env.NEXT_PUBLIC_*` in client bundles.
 */
const publicRuntime = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

function reportInvalid(
  scope: string,
  fieldErrors: Record<string, string[] | undefined>,
): never {
  console.error(`❌ Invalid ${scope} environment variables:`);
  console.error(JSON.stringify(fieldErrors, null, 2));
  if (isServer && typeof process !== "undefined" && process.exit) {
    process.exit(1);
  }
  throw new Error(`Invalid ${scope} environment variables`);
}

const publicResult = publicSchema.safeParse(publicRuntime);
if (!publicResult.success) {
  reportInvalid("public", publicResult.error.flatten().fieldErrors);
}

let merged: Env;
const serverKeys = new Set(Object.keys(serverSchema.shape));

if (isServer) {
  const serverResult = serverSchema.safeParse(process.env);
  if (!serverResult.success) {
    reportInvalid("server", serverResult.error.flatten().fieldErrors);
  }
  merged = { ...publicResult.data, ...serverResult.data } as Env;
} else {
  merged = publicResult.data as Env;
}

export const env = new Proxy(merged, {
  get(target, prop) {
    if (typeof prop === "string" && !isServer && serverKeys.has(prop)) {
      throw new Error(
        `env.${prop} is server-only and cannot be accessed from the client.`,
      );
    }
    return Reflect.get(target, prop);
  },
});
