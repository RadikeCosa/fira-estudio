/**
 * Image utilities for product assets
 */

import { SITE_CONFIG, STORAGE, SUPABASE_STORAGE } from "@/lib/constants";
import type { ImagenProducto } from "@/lib/types";

/**
 * Resolve an image URL to a usable source.
 * Supports absolute URLs, root-relative paths, and bucket-relative paths.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return STORAGE.productPlaceholder;

  const trimmed = url.trim();
  if (!trimmed) return STORAGE.productPlaceholder;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.startsWith("products/") || trimmed.startsWith("productos/")) {
    return `${STORAGE.productsPath}/${trimmed.split("/").slice(1).join("/")}`;
  }

  if (trimmed.startsWith("supabase://")) {
    const path = trimmed.replace("supabase://", "");
    return SUPABASE_STORAGE.getPublicUrl(path);
  }

  return `${STORAGE.productsPath}/${trimmed}`;
}

/**
 * Get the primary image from a product image list.
 */
export function getPrincipalImage(
  imagenes: ImagenProducto[],
): ImagenProducto | null {
  if (imagenes.length === 0) return null;

  const principal = imagenes.find((imagen) => imagen.es_principal);
  if (principal) return principal;

  const sorted = [...imagenes].sort((a, b) => a.orden - b.orden);
  return sorted[0] ?? null;
}

/**
 * Resolve a safe alt text using a fallback.
 */
export function getImageAlt(
  altText: string | null | undefined,
  fallback: string,
): string {
  const cleaned = altText?.trim();
  return cleaned ? cleaned : fallback;
}

/**
 * Build a product image alt text using brand context.
 */
export function getProductImageAlt(
  productoNombre: string,
  altText: string | null | undefined,
): string {
  return getImageAlt(
    altText,
    `${productoNombre} - Textil artesanal de ${SITE_CONFIG.name}`,
  );
}
