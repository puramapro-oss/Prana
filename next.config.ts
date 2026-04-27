import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.i.posthog.com https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://auth.purama.dev wss://auth.purama.dev https://*.i.posthog.com https://vitals.vercel-insights.com https://*.sentry.io https://*.ingest.sentry.io https://api.openai.com https://api.elevenlabs.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://billing.stripe.com",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns", "@supabase/ssr"],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "auth.purama.dev" },
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },

  async redirects() {
    return [
      { source: "/r/:code", destination: "/signup?ref=:code", permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
