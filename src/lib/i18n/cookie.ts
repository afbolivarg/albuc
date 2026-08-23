import type { NextRequest, NextResponse } from "next/server";
import {
  inferLocaleFromAcceptLanguage,
  LOCALE_COOKIE,
  LOCALE_LOCKED_COOKIE,
  type Locale,
} from "./config";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const localeCookieOptions = {
  path: "/",
  maxAge: TEN_YEARS,
  sameSite: "lax" as const,
};

export function applyInferredLocaleCookie(
  request: NextRequest,
  response: NextResponse,
) {
  if (request.cookies.get(LOCALE_COOKIE)?.value) return response;
  const locale = inferLocaleFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions);
  if (!request.cookies.get(LOCALE_LOCKED_COOKIE)?.value) {
    response.cookies.set(LOCALE_LOCKED_COOKIE, "0", localeCookieOptions);
  }
  return response;
}

export function setLocaleOnResponse(
  response: NextResponse,
  locale: Locale,
  locked: boolean,
) {
  response.cookies.set(LOCALE_COOKIE, locale, localeCookieOptions);
  response.cookies.set(
    LOCALE_LOCKED_COOKIE,
    locked ? "1" : "0",
    localeCookieOptions,
  );
  return response;
}
