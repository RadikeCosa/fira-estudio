import { SITE_CONFIG } from "@/lib/constants";
import type { Metadata } from "next";

/**
 * Centralized Metadata builder for SEO and social sharing
 * Ensures consistent metadata across all pages
 */
export function buildMetadata({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}): Metadata {
  const resolvedImage = image ? image : `${SITE_CONFIG.url}/images/logo.png`;
  const resolvedUrl = url || SITE_CONFIG.url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      type: "website",
      locale: "es_AR",
      url: resolvedUrl,
      siteName: SITE_CONFIG.name,
      images: [resolvedImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [resolvedImage],
    },
  };
}
