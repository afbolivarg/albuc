import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import type { Sql } from "postgres"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as schema from "./schema"
import dotenv from "dotenv"

dotenv.config()

type Db = PostgresJsDatabase<typeof schema>

let pool: { client: Sql; db: Db } | undefined

function getPool(): { client: Sql; db: Db } {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    const client = postgres(process.env.DATABASE_URL)
    pool = { client, db: drizzle(client, { schema }) }
  }
  return pool
}

/**
 * Lazy DB so `next build` can load route modules without DATABASE_URL;
 * runtime still throws on first query if the variable is missing.
 */
export const db = new Proxy({} as Db, {
  get(_, prop) {
    const { db: d } = getPool()
    const value = Reflect.get(d, prop, d)
    return typeof value === "function"
      ? (value as () => unknown).bind(d)
      : value
  },
})

export const client = new Proxy({} as Sql, {
  get(_, prop) {
    const { client: c } = getPool()
    const value = Reflect.get(c, prop, c)
    return typeof value === "function"
      ? (value as () => unknown).bind(c)
      : value
  },
})
