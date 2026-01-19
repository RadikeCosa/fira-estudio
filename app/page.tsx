import { HeroSection } from "@/components/home/HeroSection";
import { TextureDivider } from "@/components/home/TextureDivider";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { ContactSection } from "@/components/home/ContactSection";
import { ProgressBar } from "@/components/layout/ProgressBar";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * Home Page - Muma Estudio
 * 
 * Estructura:
 * 1. Hero Section - Badge, título, descripción, CTAs
 * 2. Texture Divider - Imagen de textura grayscale
 * 3. Featured Products - Grid de productos destacados
 * 4. Collections Grid - Grid 2x2 de colecciones
 * 5. Contact Section - CTA de consulta personalizada
 * 6. Progress Bar - Barra de progreso de scroll
 */

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | Textiles Artesanales`,
  description:
    "Piezas únicas diseñadas para transformar tus espacios cotidianos en lugares especiales. Textiles artesanales hechos a mano.",
  openGraph: {
    title: `${SITE_CONFIG.name} | Textiles Artesanales`,
    description:
      "Piezas únicas diseñadas para transformar tus espacios cotidianos en lugares especiales.",
    type: "website",
    locale: "es_AR",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Textiles Artesanales`,
    description:
      "Piezas únicas diseñadas para transformar tus espacios cotidianos en lugares especiales.",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Texture Divider */}
      <TextureDivider />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Collections Grid */}
      <CollectionsGrid />

      {/* Contact Section */}
      <ContactSection />

      {/* Progress Bar */}
      <ProgressBar />
    </>
  );
}
