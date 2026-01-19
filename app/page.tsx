import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { getProductos } from "@/lib/supabase/queries";
import { generateOrganizationSchema } from "@/lib/seo/structured-data";
import { renderJsonLd } from "@/lib/seo/structured-data";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - Textiles Artesanales`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - Textiles Artesanales`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - Textiles Artesanales`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/og-image.jpg`],
  },
};

export default async function Home() {
  // Obtener productos destacados
  const productosResult = await getProductos({ page: 1, pageSize: 50 });
  const productosDestacados = productosResult.items
    .filter((p) => p.destacado)
    .slice(0, 4);

  // Generate Organization schema for SEO
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* JSON-LD structured data for organization */}
      <script {...renderJsonLd(organizationSchema)} />
      <div className="min-h-screen">
        <HeroSection />
        {productosDestacados.length > 0 && (
          <FeaturedProductsSection productos={productosDestacados} />
        )}
        <CategoriesSection />
        <FinalCTASection />
      </div>
    </>
  );
}
