import { MIN_SEARCH_QUERY_LENGTH } from "@albuc/domain";
import { apiError } from "@/lib/api/http";
import { appUserFromRequest } from "@/lib/api/session";
import { searchBooks } from "@/lib/open-library";

export async function GET(request: Request) {
  const user = await appUserFromRequest(request);
  if (!user) return apiError(401, "auth_required", "Sign in again.");

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < MIN_SEARCH_QUERY_LENGTH) {
    return apiError(
      400,
      "invalid_request",
      `Type at least ${MIN_SEARCH_QUERY_LENGTH} characters.`,
    );
  }

  const result = await searchBooks(query);
  return Response.json({ results: result.results ?? [] });
}
