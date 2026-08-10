import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { TextureDivider } from "@/components/home/TextureDivider";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { CollectionsGridSkeleton } from "@/components/home/CollectionsGridSkeleton";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { ProgressBar } from "@/components/layout/ProgressBar";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

const HOME_META_DESCRIPTION =
  "Textiles artesanales para la mesa y el hogar: manteles, servilletas, caminos de mesa y otras piezas. Explorá el catálogo y consultá disponibilidad.";

/**
 * Home Page - Fira Estudio
 *
 * Estructura:
 * 1. Hero Section - Badge, título, descripción, CTAs
 * 2. Texture Divider - Imagen de textura grayscale
 * 3. Featured Products - Grid de productos destacados
 * 4. Collections Grid - Grid 3-col de colecciones con Suspense loader
 * 5. Final CTA Section - CTA de consulta personalizada
 * 6. Progress Bar - Barra de progreso de scroll
 */

export const metadata: Metadata = buildMetadata({
  title: "Textiles artesanales",
  description: HOME_META_DESCRIPTION,
  url: "/",
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

      {/* Collections Grid with Suspense Boundary */}
      <Suspense fallback={<CollectionsGridSkeleton />}>
        <CollectionsGrid />
      </Suspense>

      {/* Final CTA Section */}
      <FinalCTASection />

      {/* Progress Bar */}
      <ProgressBar />
    </>
  );
}
