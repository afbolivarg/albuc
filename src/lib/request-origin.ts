import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerList.get("host");
  if (!host) return env.NEXT_PUBLIC_SITE_URL;

  const proto =
    headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") || host.startsWith("127.")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
