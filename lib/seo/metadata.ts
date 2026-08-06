import { SITE_CONFIG } from "@/lib/constants";
import type { Metadata } from "next";

function normalizeSiteUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
}

function resolveUrl(
  value: string | undefined,
  siteUrl: string | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (!siteUrl) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  return `${siteUrl}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

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
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}): Metadata {
  const siteUrl = normalizeSiteUrl(SITE_CONFIG.url);
  const resolvedImage = resolveUrl(image ?? "/images/logo.png", siteUrl);
  const resolvedUrl = resolveUrl(url, siteUrl) ?? siteUrl;
  const resolvedImages = resolvedImage ? [resolvedImage] : undefined;

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
      follow: !noIndex,
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
