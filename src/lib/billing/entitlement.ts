import type { User } from "@/lib/db/schema";

export const YEARLY_PRICE_USD = 25;
export const REFUND_DAYS = 14;
export const REFUND_EMAIL = "refunds@albuc.com";
export const SUPPORT_EMAIL = "support@albuc.com";
export const NOTE_TEASER_CHARS = 800;

type MaybeDate = Date | string | null;

export type BillingUser = Pick<
  User,
  | "id"
  | "email"
  | "billingExempt"
  | "creemCustomerId"
  | "creemSubscriptionId"
  | "subscriptionStatus"
  | "subscriptionCancelAtPeriodEnd"
> & {
  subscriptionPeriodStart: MaybeDate;
  subscriptionPeriodEnd: MaybeDate;
};

export function toBillingDate(value: MaybeDate): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toTime(value: MaybeDate): number | null {
  return toBillingDate(value)?.getTime() ?? null;
}

export function hasFullAccess(user: BillingUser): boolean {
  if (user.billingExempt) return true;

  const status = user.subscriptionStatus;
  if (status === "active" || status === "past_due" || status === "trialing") {
    return true;
  }

  const periodEnd = toTime(user.subscriptionPeriodEnd);
  if (status === "canceled" && periodEnd !== null && periodEnd > Date.now()) {
    return true;
  }

  return false;
}

export function hasGivenName(user: {
  firstName?: string | null;
  lastName?: string | null;
}): boolean {
  return Boolean(user.firstName?.trim() && user.lastName?.trim());
}

export function hasBillingHistory(user: BillingUser): boolean {
  return Boolean(
    user.creemCustomerId ||
      user.creemSubscriptionId ||
      (user.subscriptionStatus && user.subscriptionStatus !== "none"),
  );
}

export type SignedInUser = BillingUser & {
  firstName?: string | null;
  lastName?: string | null;
  onboardingCompletedAt?: Date | string | null;
};

/** Where a signed-in user should land. Lapsed shelves stay on /library. */
export function signedInPath(user: SignedInUser): string {
  if (!hasGivenName(user)) return "/onboarding";
  if (!hasFullAccess(user)) {
    if (user.onboardingCompletedAt != null && hasBillingHistory(user)) {
      return "/library";
    }
    return "/subscribe";
  }
  if (user.onboardingCompletedAt == null) return "/onboarding";
  return "/library";
}

export function teaserNote(markdown: string | null): string {
  if (!markdown) return "";
  if (markdown.length <= NOTE_TEASER_CHARS) return markdown;
  return markdown.slice(0, NOTE_TEASER_CHARS);
}
