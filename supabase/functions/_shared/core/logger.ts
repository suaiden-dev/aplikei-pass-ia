type LogData = Record<string, unknown>;

type Logger = {
  info: (msg: string, data?: LogData) => void;
  warn: (msg: string, data?: LogData) => void;
  error: (msg: string, err?: unknown, data?: LogData) => void;
};

export function createLogger(scope: string): Logger {
  return {
    info: (msg, data) =>
      console.log(JSON.stringify({ scope, level: "info", msg, ...data })),

    warn: (msg, data) =>
      console.warn(JSON.stringify({ scope, level: "warn", msg, ...data })),

    error: (msg, err, data) =>
      console.error(
        JSON.stringify({
          scope,
          level: "error",
          msg,
          error: err instanceof Error ? err.message : String(err ?? ""),
          ...data,
        }),
      ),
  };
}
