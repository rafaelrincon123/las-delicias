import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import NavShell from "@/components/NavShell";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  metadataBase: new URL("https://las-delicias-mddw.vercel.app"),
  title: "Las Delicias · Sistema ganadero",
  description: "Sistema de gestión del hato de Las Delicias",
  openGraph: {
    title: "Ganadería Las Delicias",
    description: "Tradición familiar, genética y progreso.",
    type: "website",
    locale: "es_CO",
    siteName: "Las Delicias",
  },
  twitter: {
    card: "summary",
    title: "Ganadería Las Delicias",
    description: "Tradición familiar, genética y progreso.",
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
      className={`${GeistSans.variable} ${GeistMono.variable}`}
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
