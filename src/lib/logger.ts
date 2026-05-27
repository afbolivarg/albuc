import { env } from "./env";

type LogLevel = "debug" | "info" | "warn" | "error";

const { LOG_LEVEL: minLevel, LOG_PRETTY: isPretty } = env;

const levelRank: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const colors: Record<LogLevel, string> = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

function format(
  level: LogLevel,
  service: string,
  message: string,
  attrs?: Record<string, unknown>,
) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    service,
    message,
    ...attrs,
  };

  if (!isPretty) return JSON.stringify(entry);

  const extras = attrs ? JSON.stringify(attrs) : "";
  return `${colors[level]}[${level.toUpperCase()}]\x1b[0m ${entry.timestamp} [${service}] ${message} ${extras}`;
}

function write(
  level: LogLevel,
  output: (message: string) => void,
  service: string,
  message: string,
  attrs?: Record<string, unknown>,
) {
  if (levelRank[level] < levelRank[minLevel]) return;
  output(format(level, service, message, attrs));
}

export const createLogger = (service: string) => ({
  debug: (message: string, attrs?: Record<string, unknown>) =>
    write("debug", console.debug, service, message, attrs),
  info: (message: string, attrs?: Record<string, unknown>) =>
    write("info", console.log, service, message, attrs),
  warn: (message: string, attrs?: Record<string, unknown>) =>
    write("warn", console.warn, service, message, attrs),
  error: (message: string, error?: Error, attrs?: Record<string, unknown>) =>
    write("error", console.error, service, message, {
      ...attrs,
      ...(error && { error: { message: error.message, stack: error.stack } }),
    }),
});

export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
