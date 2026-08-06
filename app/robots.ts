/**
 * robots.txt configuration
 * Tells search engine crawlers which pages to crawl
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/_next/",
        "/private/",
        "/carrito",
        "/checkout",
        "/checkout/",
        "/test-errors",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
