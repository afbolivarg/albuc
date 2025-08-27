import { getCurrentUser } from "@/lib/supabase/user"
import { db } from "@/lib/db"
import {
  Book,
  NewBook,
  NewUser,
  User,
  books,
  users,
  subscriptions,
  orders,
} from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { PlanType } from "@/lib/billing/plan"

export async function getUser() {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
  })

  return user ?? null
}

export async function getUserWithPlan(): Promise<
  (User & { plan: PlanType; bookLimit: number }) | null
> {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
    with: {
      subscriptions: true,
      orders: true,
    },
  })

  if (!user) {
    return null
  }

  // Determine plan based on subscriptions and orders
  const lifetimeVariantId = process.env.LEMON_SQUEEZY_VARIANT_ID_LIFETIME

  // Check for lifetime access first
  if (lifetimeVariantId) {
    const hasLifetime = user.orders.some(
      order => order.variantId === lifetimeVariantId && order.status === "paid"
    )

    if (hasLifetime) {
      return {
        ...user,
        plan: "lifetime" as PlanType,
        bookLimit: Number.POSITIVE_INFINITY,
      }
    }
  }

  // Check for active subscription
  const activeSubscription = user.subscriptions.find(sub =>
    ["active", "on_trial"].includes(sub.status)
  )

  if (activeSubscription) {
    return {
      ...user,
      plan: "monthly" as PlanType,
      bookLimit: Number.POSITIVE_INFINITY,
    }
  }

  // Default to free plan
  return {
    ...user,
    plan: "free" as PlanType,
    bookLimit: 10,
  }
}

export async function getUserByGoogleSub(googleSub: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, googleSub),
  })

  return user ?? null
}

export async function updateUser(user: User) {
  return await db
    .update(users)
    .set(user)
    .where(eq(users.googleSub, user.googleSub))
    .returning()
}

export async function createUser(user: NewUser) {
  return await db.insert(users).values(user).returning()
}

export async function getUserWithBooks() {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
    with: {
      books: {
        orderBy: desc(books.updatedAt),
      },
    },
  })

  return user ?? null
}

export async function getUserWithBook(bookId: string) {
  const supabaseUser = await getCurrentUser()

  if (!supabaseUser) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.googleSub, supabaseUser.id),
    with: {
      books: {
        where: eq(books.id, bookId),
      },
    },
  })
  return user ?? null
}

export async function getUserBookByWorkKey(userId: string, workKey: string) {
  const result = await db.query.books.findFirst({
    where: and(eq(books.userId, userId), eq(books.workKey, workKey)),
  })
  return result ?? null
}

export async function getUserBook(userId: string, bookId: string) {
  const result = await db
    .select()
    .from(books)
    .where(and(eq(books.userId, userId), eq(books.id, bookId)))
    .limit(1)

  return result.length > 0 ? result[0] : null
}

export async function createBook(book: NewBook) {
  return await db.insert(books).values(book).returning()
}

export async function updateBook(book: Book) {
  return await db
    .update(books)
    .set(book)
    .where(eq(books.id, book.id))
    .returning()
}

// export async function getUserUsageAndPlan(userId: string) {
//   const [{ total }] = await db
//     .select({ total: count(userBooks.id) })
//     .from(userBooks)
//     .where(eq(userBooks.userId, userId))

//   const plan = await getUserPlan(userId)

//   return {
//     current: Number(total ?? 0),
//     limit: plan.bookLimit,
//     plan: plan.plan,
//     canAddMore:
//       plan.bookLimit === Infinity || Number(total ?? 0) < plan.bookLimit,
//   } as const
// }
