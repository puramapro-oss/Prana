type LogLevel = "info" | "warn" | "error"

interface LogPayload {
  msg: string
  [key: string]: unknown
}

function emit(level: LogLevel, payload: LogPayload) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    app: "prana",
    ...payload,
  }
  const line = JSON.stringify(entry)
  if (level === "error") process.stderr.write(line + "\n")
  else process.stdout.write(line + "\n")
}

export const log = {
  info: (msg: string, ctx?: Record<string, unknown>) => emit("info", { msg, ...(ctx ?? {}) }),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit("warn", { msg, ...(ctx ?? {}) }),
  error: (msg: string, ctx?: Record<string, unknown>) => emit("error", { msg, ...(ctx ?? {}) }),
}
