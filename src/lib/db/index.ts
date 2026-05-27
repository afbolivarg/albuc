import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

const queryClient = postgres(env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

/** Requires `DATABASE_URL` at module load time. */
export const db = drizzle(queryClient, {
  schema,
});
