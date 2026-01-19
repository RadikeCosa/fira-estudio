import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants"; // ← Importar
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
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
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <SpeedInsights />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
