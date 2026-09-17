import { Webhook } from "@creem_io/nextjs";
import { NextResponse } from "next/server";
import { customerIdFrom, upsertSubscription } from "@/lib/billing/sync";
import { env } from "@/lib/env";
import { createLogger, toError } from "@/lib/logger";

const log = createLogger("billing.webhook");

function referenceId(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as { referenceId?: unknown }).referenceId;
  return typeof value === "string" ? value : null;
}

function emailOf(customer: { email?: string } | undefined) {
  return customer?.email ?? null;
}

export const POST = env.CREEM_WEBHOOK_SECRET
  ? Webhook({
      webhookSecret: env.CREEM_WEBHOOK_SECRET,
      onGrantAccess: async (data) => {
        await upsertSubscription({
          userId: referenceId(data.metadata),
          email: emailOf(data.customer),
          creemCustomerId: customerIdFrom(data.customer),
          creemSubscriptionId: data.id,
          status: "active",
          periodStart: data.current_period_start_date,
          periodEnd: data.current_period_end_date,
          cancelAtPeriodEnd: false,
        });
      },
      onSubscriptionScheduledCancel: async (data) => {
        await upsertSubscription({
          userId: referenceId(data.metadata),
          email: emailOf(data.customer),
          creemCustomerId: customerIdFrom(data.customer),
          creemSubscriptionId: data.id,
          status: "canceled",
          periodStart: data.current_period_start_date,
          periodEnd: data.current_period_end_date,
          cancelAtPeriodEnd: true,
        });
      },
      onSubscriptionCanceled: async (data) => {
        await upsertSubscription({
          userId: referenceId(data.metadata),
          email: emailOf(data.customer),
          creemCustomerId: customerIdFrom(data.customer),
          creemSubscriptionId: data.id,
          status: "canceled",
          periodStart: data.current_period_start_date,
          periodEnd: data.current_period_end_date,
          cancelAtPeriodEnd: true,
        });
      },
      onSubscriptionPastDue: async (data) => {
        await upsertSubscription({
          userId: referenceId(data.metadata),
          email: emailOf(data.customer),
          creemCustomerId: customerIdFrom(data.customer),
          creemSubscriptionId: data.id,
          status: "past_due",
          periodStart: data.current_period_start_date,
          periodEnd: data.current_period_end_date,
        });
      },
      onRevokeAccess: async (data) => {
        await upsertSubscription({
          userId: referenceId(data.metadata),
          email: emailOf(data.customer),
          creemCustomerId: customerIdFrom(data.customer),
          creemSubscriptionId: data.id,
          status: data.reason === "subscription_paused" ? "paused" : "expired",
          periodStart: data.current_period_start_date,
          periodEnd: data.current_period_end_date,
          cancelAtPeriodEnd: false,
        });
      },
      onSubscriptionUnpaid: async (data) => {
        await upsertSubscription({
          userId: referenceId(data.metadata),
          email: emailOf(data.customer),
          creemCustomerId: customerIdFrom(data.customer),
          creemSubscriptionId: data.id,
          status: "unpaid",
          periodStart: data.current_period_start_date,
          periodEnd: data.current_period_end_date,
        });
      },
      onRefundCreated: async (data) => {
        try {
          const customer =
            typeof data.customer === "string"
              ? data.customer
              : data.customer?.id;
          await upsertSubscription({
            creemCustomerId: customer ?? null,
            email:
              typeof data.customer === "object" ? data.customer?.email : null,
            status: "refunded",
            cancelAtPeriodEnd: false,
          });
        } catch (error) {
          log.error("refund upsert failed", toError(error));
          throw error;
        }
      },
    })
  : async () =>
      NextResponse.json({ error: "Webhook secret missing" }, { status: 503 });
