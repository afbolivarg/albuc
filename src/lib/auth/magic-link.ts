import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { authTokens, type User, users } from "@/lib/db/schema";
import { env } from "@/lib/env";

const TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function ensureAppUser(email: string): Promise<User> {
  const normalized = normalizeEmail(email);
  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = ${normalized}`,
  });
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  const [created] = await db
    .insert(users)
    .values({
      id,
      supabaseUserId: id,
      email: normalized,
    })
    .returning();
  if (!created) {
    throw new Error("Failed to create app user");
  }
  return created;
}

export async function createMagicLink(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const token = randomBytes(32).toString("base64url");
  await db.insert(authTokens).values({
    email: normalized,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return token;
}

export async function consumeMagicLink(token: string): Promise<User | null> {
  const tokenHash = hashToken(token);
  const row = await db.query.authTokens.findFirst({
    where: and(eq(authTokens.tokenHash, tokenHash), isNull(authTokens.usedAt)),
  });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(eq(authTokens.id, row.id));
  return ensureAppUser(row.email);
}

export async function sendMagicLinkEmail(email: string, link: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "albuc",
    },
    body: JSON.stringify({
      from: "Albuc <sign-in@albuc.com>",
      to: [normalizeEmail(email)],
      subject: "Sign in to Albuc",
      html: `<p>Sign in to Albuc.</p><p><a href="${link}">Continue</a></p><p>This link expires in one hour.</p>`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend send failed (${response.status})`);
  }
}
