import { eq } from "drizzle-orm";
import {
  revalidatePublicNote,
  revalidatePublicProfile,
} from "@/lib/cache-revalidate";
import { db } from "@/lib/db";
import { books, users } from "@/lib/db/schema";
import { createLogger } from "@/lib/logger";

const log = createLogger("billing.sync");

export type SubscriptionStatus =
  | "none"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "refunded"
  | "paused"
  | "trialing"
  | "unpaid";

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function customerId(customer: unknown): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if (typeof customer === "object" && customer && "id" in customer) {
    const id = (customer as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

export async function upsertSubscription(input: {
  userId?: string | null;
  email?: string | null;
  creemCustomerId?: string | null;
  creemSubscriptionId?: string | null;
  status: SubscriptionStatus;
  periodStart?: unknown;
  periodEnd?: unknown;
  cancelAtPeriodEnd?: boolean;
}) {
  const user =
    (input.userId
      ? await db.query.users.findFirst({
          where: eq(users.id, input.userId),
        })
      : null) ??
    (input.creemCustomerId
      ? await db.query.users.findFirst({
          where: eq(users.creemCustomerId, input.creemCustomerId),
        })
      : null) ??
    (input.creemSubscriptionId
      ? await db.query.users.findFirst({
          where: eq(users.creemSubscriptionId, input.creemSubscriptionId),
        })
      : null) ??
    (input.email
      ? await db.query.users.findFirst({
          where: eq(users.email, input.email),
        })
      : null);

  if (!user) {
    log.warn("no user for subscription upsert", {
      userId: input.userId,
      email: input.email,
    });
    return null;
  }

  const [updated] = await db
    .update(users)
    .set({
      creemCustomerId: input.creemCustomerId ?? user.creemCustomerId,
      creemSubscriptionId:
        input.creemSubscriptionId ?? user.creemSubscriptionId,
      subscriptionStatus: input.status,
      subscriptionPeriodStart:
        asDate(input.periodStart) ?? user.subscriptionPeriodStart,
      subscriptionPeriodEnd:
        asDate(input.periodEnd) ?? user.subscriptionPeriodEnd,
      subscriptionCancelAtPeriodEnd:
        input.cancelAtPeriodEnd ?? user.subscriptionCancelAtPeriodEnd,
    })
    .where(eq(users.id, user.id))
    .returning();

  if (updated?.handle) {
    revalidatePublicProfile(updated.handle);
  }

  const publicNotes = await db
    .select({ shareSlug: books.shareSlug })
    .from(books)
    .where(eq(books.userId, user.id));
  for (const note of publicNotes) {
    if (note.shareSlug) revalidatePublicNote(note.shareSlug);
  }

  return updated ?? null;
}

export function customerIdFrom(customer: unknown) {
  return customerId(customer);
}
