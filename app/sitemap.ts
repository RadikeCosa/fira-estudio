/**
 * Dynamic sitemap generation
 * Includes all active products with proper priority and change frequency
 */

import type { MetadataRoute } from "next";
import { getProductosFresh } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

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

  // During local builds or env-less checks, allow a static-only sitemap.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return staticPages;
  }

  try {
    // Fetch all active products only when catalog env is available.
    const { items: productos } = await getProductosFresh({
      page: 1,
      pageSize: 500,
    });

    const productUrls: MetadataRoute.Sitemap = productos.map((producto) => ({
      url: `${baseUrl}/productos/${producto.slug}`,
      lastModified: new Date(producto.created_at),
      changeFrequency: "weekly" as const,
      priority: producto.destacado ? 0.8 : 0.6,
    }));

    return [...staticPages, ...productUrls];
  } catch (error) {
    console.warn("[sitemap] Falling back to static pages only:", error);
  }

  return staticPages;
}
