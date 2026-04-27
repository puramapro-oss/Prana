/**
 * Authenticated fetch helper for PRANA API.
 *
 * Calls https://prana.purama.dev/api/* with the current Supabase access token in
 * Authorization header. The web API also accepts cookie auth, but mobile WebViews
 * are sandboxed so we explicitly pass the bearer.
 */

import { supabase, APP_BASE_URL } from "./supabase"

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Abort after this many ms (default 30_000). */
  timeoutMs?: number
}

export class ApiError extends Error {
  status: number
  body?: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, timeoutMs = 30_000, headers, method = "GET", ...rest } = options

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const url = path.startsWith("http") ? path : `${APP_BASE_URL}${path}`
    const res = await fetch(url, {
      ...rest,
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const text = await res.text()
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = text
    }

    if (!res.ok) {
      const message =
        (typeof parsed === "object" && parsed && "error" in parsed && typeof (parsed as { error?: unknown }).error === "string"
          ? (parsed as { error: string }).error
          : null) ?? `HTTP ${res.status}`
      throw new ApiError(message, res.status, parsed)
    }

    return parsed as T
  } finally {
    clearTimeout(timer)
  }
}
