type LogLevel = "debug" | "info" | "warn" | "error";

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

function getMinLevel(): LogLevel {
  const level = process.env.LOG_LEVEL;
  if (
    level === "debug" ||
    level === "info" ||
    level === "warn" ||
    level === "error"
  ) {
    return level;
  }
  return "info";
}

function isPrettyLogs(): boolean {
  const value = process.env.LOG_PRETTY;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return process.env.NODE_ENV === "development";
}

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

  if (!isPrettyLogs()) return JSON.stringify(entry);

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
  if (levelRank[level] < levelRank[getMinLevel()]) return;
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
