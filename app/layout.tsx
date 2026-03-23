import type { Metadata } from "next";
import "./globals.css";
import SeasonalTheme from "@/components/ui/SeasonalTheme";
import BreathingGuide from "@/components/ui/BreathingGuide";

export const metadata: Metadata = {
  title: "PRANA — OS de Santé Holistique",
  description:
    "Le premier OS de santé holistique au monde. 17 modules, 50+ techniques ancestrales et scientifiques, coaching IA personnalisé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6fcf8a" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg-primary text-text font-display">
        <SeasonalTheme />
        {children}
        <BreathingGuide />
      </body>
    </html>
  );
}
