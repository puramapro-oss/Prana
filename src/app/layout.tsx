import type { Metadata, Viewport } from "next"
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://prana.purama.dev"),
  title: {
    default: "PURAMA ONE — L'OS humain qui te calme, t'organise, et exécute pour toi",
    template: "%s · PURAMA ONE",
  },
  description:
    "Régule ton système nerveux en 20 secondes, organise ta vie, et laisse l'IA exécuter pour toi. PURAMA ONE — un seul système pour la clarté totale.",
  applicationName: "PURAMA ONE",
  authors: [{ name: "PURAMA" }],
  keywords: [
    "régulation système nerveux",
    "bien-être",
    "gestion du stress",
    "organisation",
    "agent IA",
    "productivité calme",
    "sommeil",
    "respiration",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://prana.purama.dev",
    siteName: "PURAMA ONE",
    title: "PURAMA ONE — L'OS humain",
    description:
      "Régule, organise, exécute. Un seul système pour la clarté totale.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PURAMA ONE",
    description: "Régule, organise, exécute.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
