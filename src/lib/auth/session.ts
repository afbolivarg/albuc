import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "albuc_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  return process.env.AUTH_SECRET ?? "";
}

export function signSession(userId: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + MAX_AGE_SECONDS;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): string | null {
  if (!token || !secret()) {
    return null;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [userId, exp, sig] = parts;
  if (!userId || !exp || !sig) {
    return null;
  }
  const payload = `${userId}.${exp}`;
  const expected = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(sig);
  if (
    expectedBuf.length !== sigBuf.length ||
    !timingSafeEqual(expectedBuf, sigBuf)
  ) {
    return null;
  }
  if (Number(exp) < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return userId;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
