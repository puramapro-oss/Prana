import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PROTECTED_PREFIXES = [
  "/today",
  "/regulate",
  "/lifeos",
  "/execute",
  "/rooms",
  "/twin",
  "/score",
  "/settings",
  "/onboarding",
]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "prana" },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Already authed → redirect away from /login and /signup
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/today", request.url))
  }

  // Protected route + no user → /login?next=<path>
  if (!user && isProtectedPath(pathname)) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon, sitemap, robots
     * - api routes (handled by their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|r/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
