import type { ApiError, ApiErrorCode } from "@albuc/domain";

export function apiError(status: number, error: ApiErrorCode, message: string) {
  const body: ApiError = { error, message };
  return Response.json(body, { status });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
