import { Metadata } from "next";
import { HeroSectionNew } from "@/components/home/HeroSectionNew";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { ContactSection } from "@/components/home/ContactSection";
import { TextureDivider } from "@/components/home/TextureDivider";
import { ProgressBar } from "@/components/layout/ProgressBar";

export const metadata: Metadata = {
  title: "Demo - Nueva Home Page | Muma Estudio",
  description: "Demostración de los nuevos componentes de la home page con diseño boutique/minimalista",
};

/**
 * Demo Page - Nueva Home Page
 * 
 * Esta página demuestra todos los nuevos componentes creados en PR #2:
 * - HeroSection con badge decorativo y CTAs
 * - FeaturedProducts con grid alternado
 * - CollectionsGrid con imágenes overlay
 * - ContactSection con borders
 * - TextureDivider con imagen
 * - ProgressBar de scroll
 */
export default function DemoNewHomePage() {
  return (
    <>
      {/* Progress Bar - Fixed at bottom */}
      <ProgressBar />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSectionNew />

        {/* Featured Products Section */}
        <FeaturedProducts />

        {/* Texture Divider */}
        <TextureDivider />

        {/* Collections Grid */}
        <CollectionsGrid />

        {/* Contact Section */}
        <ContactSection />
      </div>
    </>
  );
}
