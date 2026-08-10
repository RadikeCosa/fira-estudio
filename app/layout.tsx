import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MaintenanceBanner } from "@/components/maintenance-banner";
import { ThemeProvider } from "@/components/theme";
import { themeInitScript } from "@/components/theme/init-script";
import { SITE_CONFIG } from "@/lib/constants";
import { getSiteBaseUrlObject } from "@/lib/seo/url";
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
  metadataBase: getSiteBaseUrlObject(),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  verification: {
    google: "yIAuiC-866ahSn2Fh0PGCbmx_d6B5NNBwhXYf3778IE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <html lang="es" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <body
        className={`${playfair.variable} ${inter.variable} antialiased flex flex-col min-h-screen pt-[52px]`}
      >
        <ThemeProvider>
          <MaintenanceBanner />
          <Header />
          <main className="grow pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
        <SpeedInsights />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
