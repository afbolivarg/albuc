import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "on_trial",
  "paused",
  "past_due",
  "cancelled",
  "expired",
])
export const orderStatusEnum = pgEnum("order_status", [
  "paid",
  "refunded",
  "failed",
])
export const bookStatusEnum = pgEnum("book_status", [
  "WANT",
  "OWNED",
  "READING",
  "READ",
])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleSub: text("google_sub").notNull().unique(), // Google OIDC sub
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id").notNull().unique(),
    customerId: text("customer_id"),
    variantId: text("variant_id").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    renewsAt: timestamp("renews_at"),
    endsAt: timestamp("ends_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  table => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
  ]
)

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull().unique(),
    customerId: text("customer_id"),
    variantId: text("variant_id").notNull(),
    status: orderStatusEnum("status").notNull(),
    paidAt: timestamp("paid_at"),
    refundedAt: timestamp("refunded_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  table => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ]
)

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workKey: text("work_key").notNull(), // e.g. "/works/OL166894W"
    editionKey: text("edition_key"), // e.g. "/books/OL37239326M" (optional)
    title: text("title").notNull(),
    authors: text("authors").array(), // array of author names for quick display
    authorKeys: text("author_keys").array(), // e.g. ["OL26320A"]
    publishYear: integer("publish_year"),
    coverId: integer("cover_id"), // from search "cover_i" (optional)
    isbn10: text("isbn_10").array(),
    isbn13: text("isbn_13").array(),
    status: bookStatusEnum("status").notNull(),
    rating: numeric("rating", { precision: 2, scale: 1 }), // 0.5 steps allowed, 0-5 range
    noteMarkdown: text("note_markdown"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  table => [
    index("user_books_user_id_idx").on(table.userId),
    index("user_books_status_idx").on(table.status),
    index("user_books_updated_at_idx").on(table.updatedAt.desc()),
  ]
)

export const booksRelations = relations(books, ({ one }) => ({
  user: one(users, {
    fields: [books.userId],
    references: [users.id],
  }),
}))

export const userRelations = relations(users, ({ many }) => ({
  books: many(books),
  subscriptions: many(subscriptions),
  orders: many(orders),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
