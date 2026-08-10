import { SITE_CONFIG } from "@/lib/constants";
import { resolveAbsoluteUrl } from "@/lib/seo/url";
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
  noIndex = false,
  follow = !noIndex,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  follow?: boolean;
}): Metadata {
  const resolvedImage = resolveAbsoluteUrl(image ?? "/images/logo.png");
  const resolvedUrl = url ? resolveAbsoluteUrl(url) : undefined;
  const resolvedImages = [resolvedImage];

  return {
    title,
    description,
    alternates: resolvedUrl
      ? {
          canonical: resolvedUrl,
        }
      : undefined,
    robots: {
      index: !noIndex,
      follow,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      type: "website",
      locale: "es_AR",
      url: resolvedUrl,
      siteName: SITE_CONFIG.name,
      images: resolvedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: resolvedImages,
    },
  };
}
