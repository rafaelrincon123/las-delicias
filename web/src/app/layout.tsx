import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Instrument_Serif } from "next/font/google";
import "./globals.css";
import NavShell from "@/components/NavShell";
import AuthGate from "@/components/AuthGate";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://las-delicias-mddw.vercel.app"),
  title: "MiFinca · Gestión ganadera",
  description: "Registra tu finca y controla tu hato: animales, sanidad, gastos y más.",
  openGraph: {
    title: "MiFinca — Gestión ganadera",
    description: "La app para cualquier ganadero: hato, sanidad, gastos y actividades.",
    type: "website",
    locale: "es_CO",
    siteName: "MiFinca",
  },
  twitter: {
    card: "summary",
    title: "MiFinca — Gestión ganadera",
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen antialiased">
        <AuthGate>
          <div className="app-bg" aria-hidden />
          <div className="app-glow-1" aria-hidden />
          <div className="app-glow-2" aria-hidden />
          <NavShell>{children}</NavShell>
        </AuthGate>
      </body>
    </html>
  );
}
