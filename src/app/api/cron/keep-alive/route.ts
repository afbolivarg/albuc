import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";

export const maxDuration = 30;

const log = createLogger("api.cron.keep-alive");

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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const [dbPing, counts] = await Promise.all([
      db.execute(sql`select 1 as ok`),
      db.execute(sql`
        select
          (select count(*)::int from users) as users,
          (select count(*)::int from books) as books
      `),
    ]);

    log.info("keep-alive ok", {
      db: Array.isArray(dbPing) && dbPing.length > 0,
    });

    return Response.json({
      ok: true,
      db: true,
      counts: counts[0] ?? null,
    });
  } catch (error) {
    log.error("keep-alive failed", toError(error));
    return Response.json({ ok: false }, { status: 500 });
  }
}
