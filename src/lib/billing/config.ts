import { env } from "@/lib/env";

export function isCreemTestMode() {
  return (env.CREEM_API_KEY ?? "").startsWith("creem_test_");
}

export function isCreemConfigured() {
  return Boolean(env.CREEM_API_KEY && env.CREEM_PRODUCT_ID);
}

export function creemApiBase() {
  return isCreemTestMode()
    ? "https://test-api.creem.io"
    : "https://api.creem.io";
}
