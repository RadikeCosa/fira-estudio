import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
