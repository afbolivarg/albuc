import { createSafeActionClient } from "next-safe-action";
import { getUser } from "@/lib/db/queries";

export const unauthenticatedAction = createSafeActionClient({
  handleServerError(e) {
    return {
      error: e.message,
    };
  },
});

export const authenticatedAction = unauthenticatedAction.use(
  async ({ next }) => {
    const user = await getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    return next({ ctx: { user } });
  },
);
