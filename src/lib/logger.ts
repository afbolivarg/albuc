/**
 * Structured server-side logging. Use instead of console.error for errors.
 */

type LogContext = Record<string, string | number | boolean | undefined | null>;

export function logError(error: unknown, context?: LogContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const payload = { ...context, message, stack };
  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", payload);
  } else {
    console.error(JSON.stringify({ level: "error", ...payload }));
  }
}

export function logWarning(message: string, context?: LogContext): void {
  const payload = { ...context, message };
  if (process.env.NODE_ENV === "development") {
    console.warn("[WARN]", payload);
  } else {
    console.warn(JSON.stringify({ level: "warn", ...payload }));
  }
}
