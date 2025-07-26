import { createSafeActionClient } from "next-safe-action"
import { getUser } from "@/lib/db/queries"

export const actionClient = createSafeActionClient()

export const authenticatedAction = actionClient.use(async ({ next }) => {
  const user = await getUser()
  if (!user) {
    throw new Error("User is not authenticated")
  }

  return next({
    ctx: {
      user,
    },
  })
})
