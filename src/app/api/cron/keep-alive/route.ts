import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";

export const maxDuration = 30;

const log = createLogger("api.cron.keep-alive");

/**
 * Supabase Free pauses projects with too little *user database activity*
 * over a rolling 7-day window. Dashboard visits do not count. A few real
 * queries each day is typically enough to stay unpaused.
 *
 * This job hits Postgres directly and the Supabase Auth/REST surfaces so
 * both the database and the project API register activity.
 */
function isAuthorized(request: Request): boolean {
  if (env.NODE_ENV !== "production") {
    return true;
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function pingSupabase(): Promise<{ auth: boolean; rest: boolean }> {
  const headers = {
    apikey: env.SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
  };

  const [auth, rest] = await Promise.all([
    fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
      headers,
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false),
    fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id&limit=1`, {
      headers: {
        ...headers,
        Accept: "application/json",
      },
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false),
  ]);

  return { auth, rest };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const [dbPing, counts, supabase] = await Promise.all([
      db.execute(sql`select 1 as ok`),
      db.execute(sql`
        select
          (select count(*)::int from users) as users,
          (select count(*)::int from books) as books
      `),
      pingSupabase(),
    ]);

    log.info("keep-alive ok", {
      db: Array.isArray(dbPing) && dbPing.length > 0,
      supabase,
    });

    return Response.json({
      ok: true,
      db: true,
      counts: counts[0] ?? null,
      supabase,
    });
  } catch (error) {
    log.error("keep-alive failed", toError(error));
    return Response.json({ ok: false }, { status: 500 });
  }
}
