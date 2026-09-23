import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import NavShell from "@/components/NavShell";
import AuthGate from "@/components/AuthGate";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rumea.app"),
  title: "RumeApp · Gestión ganadera",
  description: "Registra tu finca y controla tu hato: animales, sanidad, gastos y más.",
  appleWebApp: { capable: true, title: "RumeApp", statusBarStyle: "default" },
  openGraph: {
    title: "RumeApp — Gestión ganadera",
    description: "La app para cualquier ganadero: hato, sanidad, gastos y actividades.",
    type: "website",
    locale: "es_CO",
    siteName: "RumeApp",
  },
  twitter: {
    card: "summary_large_image",
    title: "RumeApp — Gestión ganadera",
    description: "Registra tu finca y controla tu hato.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8F5EE",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${spaceGrotesk.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <AuthGate>
          <div className="app-bg" aria-hidden />
          <div className="app-glow-1" aria-hidden />
          <div className="app-glow-2" aria-hidden />
          <NavShell>{children}</NavShell>
        </AuthGate>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
