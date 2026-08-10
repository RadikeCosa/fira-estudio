/**
 * robots.txt configuration
 * Tells search engine crawlers which pages to crawl
 */

import type { MetadataRoute } from "next";
import { resolveAbsoluteUrl } from "@/lib/seo/url";

export default function robots(): MetadataRoute.Robots {
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
    sitemap: resolveAbsoluteUrl("/sitemap.xml"),
  };
}
