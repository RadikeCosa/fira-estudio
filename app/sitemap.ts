/**
 * Dynamic sitemap generation
 * Includes all active products with proper priority and change frequency
 */

import type { MetadataRoute } from "next";
import { getProductos } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mumaestudio.com";

  // Fetch all active products
  const productos = await getProductos();

  // Generate product URLs
  const productUrls: MetadataRoute.Sitemap = productos.map((producto) => ({
    url: `${baseUrl}/productos/${producto.slug}`,
    lastModified: new Date(producto.created_at),
    changeFrequency: "weekly" as const,
    priority: producto.destacado ? 0.8 : 0.6,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  return [...staticPages, ...productUrls];
}
