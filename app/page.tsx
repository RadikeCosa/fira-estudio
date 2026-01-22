import { HeroSection } from "@/components/home/HeroSection";
import { TextureDivider } from "@/components/home/TextureDivider";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { ProgressBar } from "@/components/layout/ProgressBar";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Home Page - Muma Estudio
 *
 * Estructura:
 * 1. Hero Section - Badge, título, descripción, CTAs
 * 2. Texture Divider - Imagen de textura grayscale
 * 3. Featured Products - Grid de productos destacados
 * 4. Collections Grid - Grid 2x2 de colecciones
 * 5. Final CTA Section - CTA de consulta personalizada
 * 6. Progress Bar - Barra de progreso de scroll
 */

export const metadata: Metadata = buildMetadata({
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
});

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

      {/* Final CTA Section */}
      <FinalCTASection />

      {/* Progress Bar */}
      <ProgressBar />
    </>
  );
}
