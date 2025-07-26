import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core"

// Users table for Google authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleSub: text("google_sub").notNull().unique(), // Google OIDC sub
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Books cataloged by users (junction to a canonical Work/Edition)
export const userBooks = pgTable(
  "user_books",
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
    status: text("status")
      .notNull()
      .$type<"WANT" | "OWNED" | "READING" | "READ">(),
    rating: numeric("rating", { precision: 2, scale: 1 }), // 0.5 steps allowed, 0-5 range
    owned: boolean("owned").default(false), // redundant if status==OWNED but useful
    noteMarkdown: text("note_markdown"),
    noteHtml: text("note_html"), // sanitized pre-render for fast view
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index("user_books_user_id_idx").on(table.userId),
    statusIdx: index("user_books_status_idx").on(table.status),
    updatedAtIdx: index("user_books_updated_at_idx").on(table.updatedAt.desc()),
  })
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserBook = typeof userBooks.$inferSelect
export type NewUserBook = typeof userBooks.$inferInsert
