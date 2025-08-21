import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscriptions, orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("X-Signature") || ""

  // Verify webhook signature
  const secret =
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET ||
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ||
    ""
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(rawBody).digest("hex")
  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const { meta, data } = event
  const eventType = meta.event_name
  const { userId } = meta.custom_data || {}

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  switch (eventType) {
    case "subscription_created":
    case "subscription_updated": {
      const subscriptionId: string = data.id
      const variantId: string = data.attributes.variant_id?.toString()
      const status = data.attributes
        .status as (typeof subscriptions.$inferSelect)["status"]
      const renewsAt = data.attributes.renews_at
        ? new Date(data.attributes.renews_at)
        : null
      const endsAt = data.attributes.ends_at
        ? new Date(data.attributes.ends_at)
        : null

      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(subscriptions)
          .set({
            subscriptionId,
            variantId,
            status,
            renewsAt: renewsAt || null,
            endsAt: endsAt || null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId))
      } else {
        await db.insert(subscriptions).values({
          userId,
          subscriptionId,
          customerId: data.attributes.customer_id?.toString() || null,
          variantId,
          status,
          renewsAt: renewsAt || null,
          endsAt: endsAt || null,
        })
      }
      break
    }

    case "subscription_cancelled":
    case "subscription_expired": {
      await db
        .update(subscriptions)
        .set({
          status:
            eventType === "subscription_cancelled" ? "cancelled" : "expired",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
      break
    }

    case "subscription_paused": {
      await db
        .update(subscriptions)
        .set({ status: "paused", updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId))
      break
    }

    case "subscription_resumed": {
      await db
        .update(subscriptions)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(subscriptions.userId, userId))
      break
    }

    // Lifetime / one-time purchases
    case "order_created":
    case "order_refunded": {
      const orderId: string = data.id
      const variantId: string =
        data.attributes.first_order_item?.variant_id?.toString() ||
        data.attributes.variant_id?.toString()

      const status: "paid" | "refunded" | "failed" =
        eventType === "order_refunded"
          ? "refunded"
          : data.attributes.status === "paid"
            ? "paid"
            : data.attributes.status === "refunded"
              ? "refunded"
              : "failed"

      const paidAt = data.attributes.created_at
        ? new Date(data.attributes.created_at)
        : null

      // Idempotent upsert by orderId
      const existingOrder = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, orderId))
        .limit(1)

      if (existingOrder.length > 0) {
        await db
          .update(orders)
          .set({
            status,
            refundedAt: status === "refunded" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(orders.orderId, orderId))
      } else {
        await db.insert(orders).values({
          userId,
          orderId,
          customerId: data.attributes.customer_id?.toString() || null,
          variantId: variantId || "",
          status,
          paidAt,
        })
      }
      break
    }

    default:
      console.error(`Unhandled event: ${eventType}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
