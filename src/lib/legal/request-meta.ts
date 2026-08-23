import type { NextRequest } from "next/server"

export function getRequestMeta(req: NextRequest | Request): { ip: string | null; userAgent: string | null } {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  }
}
