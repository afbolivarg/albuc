import { Checkout } from "@creem_io/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { isCreemConfigured, isCreemTestMode } from "@/lib/billing/config";
import {
  hasFullAccess,
  hasGivenName,
  signedInPath,
} from "@/lib/billing/entitlement";
import { getUser } from "@/lib/db/queries";
import { env } from "@/lib/env";

const checkout = Checkout({
  apiKey: env.CREEM_API_KEY || "missing",
  testMode: isCreemTestMode(),
  defaultSuccessUrl: "/subscribe?checkout=success",
});

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!isCreemConfigured() || !env.CREEM_PRODUCT_ID) {
    return NextResponse.json(
      { error: "Billing is not configured" },
      { status: 503 },
    );
  }

  if (!hasGivenName(user)) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (hasFullAccess(user) && !user.subscriptionCancelAtPeriodEnd) {
    return NextResponse.redirect(new URL(signedInPath(user), request.url));
  }

  const url = request.nextUrl.clone();
  url.searchParams.set("productId", env.CREEM_PRODUCT_ID);
  url.searchParams.set(
    "customer",
    JSON.stringify({
      email: user.email,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
    }),
  );
  url.searchParams.set("referenceId", user.id);
  url.searchParams.set("requestId", user.id);
  url.searchParams.set("successUrl", "/subscribe?checkout=success");

  return checkout(
    new NextRequest(url, {
      headers: request.headers,
    }),
  );
}
