import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants"; // ← Importar
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - Textiles Artesanales`, // ← Usar constante
    template: `%s | ${SITE_CONFIG.name}`, // ← Usar constante
  },
  description: SITE_CONFIG.description, // ← Usar constante
  keywords: SITE_CONFIG.keywords, // ← Usar constante
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale, // ← Usar constante
    siteName: SITE_CONFIG.name, // ← Usar constante
    title: `${SITE_CONFIG.name} - Textiles Artesanales`,
    description: SITE_CONFIG.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-grow pt-16">{children}</main>
        <Footer />
        <SpeedInsights />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
