import { Portal } from "@creem_io/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { isCreemTestMode } from "@/lib/billing/config";
import { getUser } from "@/lib/db/queries";
import { env } from "@/lib/env";

const portal = Portal({
  apiKey: env.CREEM_API_KEY || "missing",
  testMode: isCreemTestMode(),
});

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!user.creemCustomerId) {
    return NextResponse.redirect(new URL("/subscribe", request.url));
  }

  const url = request.nextUrl.clone();
  url.searchParams.set("customer_id", user.creemCustomerId);
  url.searchParams.set("customerId", user.creemCustomerId);

  return portal(
    new NextRequest(url, {
      headers: request.headers,
    }),
  );
}
