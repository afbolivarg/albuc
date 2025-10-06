import { relations, sql } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  index,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core"

// Custom type for pgvector
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(768)"
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value)
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value)
  },
})

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

export const usageCounters = pgTable(
  "usage_counters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // Format: "YYYY-MM"
    queriesUsed: integer("queries_used").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  table => [
    index("usage_counters_user_id_idx").on(table.userId),
    index("usage_counters_month_idx").on(table.month),
    index("usage_counters_user_month_idx").on(table.userId, table.month),
  ]
)

export const noteChunks = pgTable(
  "note_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chunk: text("chunk").notNull(),
    embedding: vector("embedding").notNull(),
    modelVersion: text("model_version").notNull().default("text-embedding-004"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  table => [
    index("note_chunks_book_id_idx").on(table.bookId),
    // IVFFlat index for vector similarity search using cosine distance
    index("note_chunks_embedding_idx").using(
      "ivfflat",
      sql`${table.embedding} vector_cosine_ops`
    ),
  ]
)

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(users, {
    fields: [books.userId],
    references: [users.id],
  }),
  noteChunks: many(noteChunks),
}))

export const userRelations = relations(users, ({ many }) => ({
  books: many(books),
  subscriptions: many(subscriptions),
  orders: many(orders),
  usageCounters: many(usageCounters),
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

export const usageCountersRelations = relations(usageCounters, ({ one }) => ({
  user: one(users, {
    fields: [usageCounters.userId],
    references: [users.id],
  }),
}))

export const noteChunksRelations = relations(noteChunks, ({ one }) => ({
  book: one(books, {
    fields: [noteChunks.bookId],
    references: [books.id],
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
export type UsageCounter = typeof usageCounters.$inferSelect
export type NewUsageCounter = typeof usageCounters.$inferInsert
export type NoteChunk = typeof noteChunks.$inferSelect
export type NewNoteChunk = typeof noteChunks.$inferInsert

// Helper to create a new note chunk with current model version
export function createNoteChunkData(
  bookId: string,
  chunk: string,
  embedding: number[]
): NewNoteChunk {
  return {
    bookId,
    chunk,
    embedding,
    modelVersion: "text-embedding-004", // Always use current model
  }
}
