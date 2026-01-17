/**
 * SEO Structured Data (JSON-LD) generators
 * Implements Schema.org markup for better search engine understanding
 */

import type { ProductoCompleto } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * Generate Product structured data
 * @param producto - Complete product with variations and images
 * @returns JSON-LD script object
 */
export function generateProductSchema(producto: ProductoCompleto) {
  // Get main image
  const mainImage =
    producto.imagenes.find((img) => img.es_principal)?.url ||
    producto.imagenes[0]?.url;

  // Calculate price range from variations
  const activeVariations = producto.variaciones.filter((v) => v.activo);
  const prices = activeVariations.map((v) => v.precio);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  // Determine availability
  const hasStock = activeVariations.some((v) => v.stock > 0);
  const availability = hasStock
    ? "https://schema.org/InStock"
    : "https://schema.org/PreOrder"; // stock=0 means "available on request"

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: mainImage ? `${SITE_CONFIG.url}${mainImage}` : undefined,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers:
      minPrice && maxPrice
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "ARS",
            lowPrice: minPrice,
            highPrice: maxPrice,
            availability: availability,
            seller: {
              "@type": "Organization",
              name: SITE_CONFIG.name,
            },
          }
        : undefined,
    material: producto.material || undefined,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Tiempo de fabricación",
        value: producto.tiempo_fabricacion,
      },
      producto.cuidados
        ? {
            "@type": "PropertyValue",
            name: "Cuidados",
            value: producto.cuidados,
          }
        : null,
    ].filter(Boolean),
  };

  return schema;
}

/**
 * Generate BreadcrumbList structured data
 * @param items - Array of breadcrumb items {name, url}
 * @returns JSON-LD script object
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };

  return schema;
}

/**
 * Generate Organization structured data for homepage
 * @returns JSON-LD script object
 */
export function generateOrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.png`,
    sameAs: [
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      // Add more social media URLs here
    ].filter(Boolean),
  };

  return schema;
}

/**
 * Render JSON-LD script tag
 * @param schema - Schema object
 * @returns React script element props
 */
export function renderJsonLd(schema: object) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
  };
}
