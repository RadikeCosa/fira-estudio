/**
 * Google Analytics tracking utilities
 * Custom event tracking for user interactions
 */

import type { Producto, Variacion } from "@/lib/types";

// Extend window object to include gtag
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "set",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Check if Google Analytics is available and should track
 */
function canTrack(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    process.env.NODE_ENV === "production"
  );
}

/**
 * Track WhatsApp button click with product information
 * @param producto - Product being consulted
 * @param variacion - Selected variation (optional)
 */
export function trackWhatsAppClick(
  producto: Producto,
  variacion?: Variacion
): void {
  if (!canTrack()) return;

  window.gtag!("event", "whatsapp_click", {
    event_category: "engagement",
    event_label: producto.nombre,
    producto_id: producto.id,
    producto_nombre: producto.nombre,
    producto_slug: producto.slug,
    variacion_tamanio: variacion?.tamanio ?? null,
    variacion_color: variacion?.color ?? null,
    variacion_precio: variacion?.precio ?? null,
    value: variacion?.precio ?? producto.precio_desde ?? 0,
  });
}

/**
 * Track product detail page view
 * @param producto - Product being viewed
 */
export function trackProductView(producto: Producto): void {
  if (!canTrack()) return;

  window.gtag!("event", "view_item", {
    event_category: "ecommerce",
    event_label: producto.nombre,
    producto_id: producto.id,
    producto_nombre: producto.nombre,
    producto_slug: producto.slug,
    categoria_id: producto.categoria_id,
    precio_desde: producto.precio_desde,
    value: producto.precio_desde ?? 0,
  });
}

/**
 * Track category filter usage
 * @param categoriaSlug - Selected category slug
 * @param categoriaNombre - Category name for readable label
 */
export function trackCategoryFilter(
  categoriaSlug: string,
  categoriaNombre: string
): void {
  if (!canTrack()) return;

  window.gtag!("event", "filter_products", {
    event_category: "navigation",
    event_label: categoriaNombre,
    filter_type: "category",
    filter_value: categoriaSlug,
  });
}

/**
 * Track variation selection
 * @param producto - Product being configured
 * @param variacion - Selected variation
 */
export function trackVariationSelect(
  producto: Producto,
  variacion: Variacion
): void {
  if (!canTrack()) return;

  window.gtag!("event", "select_item", {
    event_category: "ecommerce",
    event_label: `${producto.nombre} - ${variacion.tamanio} ${variacion.color}`,
    producto_id: producto.id,
    variacion_id: variacion.id,
    variacion_tamanio: variacion.tamanio,
    variacion_color: variacion.color,
    variacion_precio: variacion.precio,
    value: variacion.precio,
  });
}
