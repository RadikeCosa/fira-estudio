/**
 * SEO Structured Data (JSON-LD) generators
 * Implements Schema.org markup for better search engine understanding
 */

import type { ProductoCompleto } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/constants";
import { resolveAbsoluteUrl } from "@/lib/seo/url";

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

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    url: resolveAbsoluteUrl(`/productos/${producto.slug}`),
    image: mainImage ? resolveAbsoluteUrl(mainImage) : undefined,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    category: producto.categoria?.nombre || undefined,
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
      item: resolveAbsoluteUrl(item.url),
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
    url: resolveAbsoluteUrl("/"),
    logo: resolveAbsoluteUrl("/images/logo.png"),
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
