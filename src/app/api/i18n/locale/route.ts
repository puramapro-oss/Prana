import { NextResponse } from "next/server"
import { z } from "zod"
import { LOCALE_COOKIE, isLocale } from "@/i18n/config"

const Body = z.object({
  locale: z.string(),
})

const ONE_YEAR = 60 * 60 * 24 * 365

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = Body.safeParse(json)
    if (!parsed.success || !isLocale(parsed.data.locale)) {
      return NextResponse.json({ error: "Locale invalide." }, { status: 400 })
    }

    const response = NextResponse.json({ ok: true, locale: parsed.data.locale })
    response.cookies.set(LOCALE_COOKIE, parsed.data.locale, {
      maxAge: ONE_YEAR,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    })
    return response
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }
}
