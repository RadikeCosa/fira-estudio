/**
 * URL Configuration por Entorno
 *
 * Este archivo centraliza la configuración de URLs para diferentes entornos:
 * - DESARROLLO: localhost:3000 (sin HTTPS)
 * - PRODUCCIÓN: https://fira-estudio.vercel.app/ (HTTPS requerido)
 *
 * Las variables se detectan automáticamente basadas en NODE_ENV y VERCEL
 */

function getBaseUrl(): string {
  // En producción Vercel, la URL es configurada automáticamente
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // En producción local o desplegada sin Vercel
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  if (siteUrl && siteUrl.length > 8 && siteUrl !== "https://") {
    return siteUrl.replace(/\/$/, "");
  }

  // Fallback: desarrollo local
  return "http://localhost:3000";
}

/**
 * Obtiene la URL completa para un path
 * @param path - Path sin leading slash (ej: "checkout/success")
 * @returns URL completa (ej: "https://fira-estudio.vercel.app/checkout/success")
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}

/**
 * URLs de retorno para Mercado Pago back_urls
 */
export const CHECKOUT_URLS = {
  success:
    process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL ||
    getFullUrl("checkout/success"),
  failure:
    process.env.NEXT_PUBLIC_CHECKOUT_FAILURE_URL ||
    getFullUrl("checkout/failure"),
  pending:
    process.env.NEXT_PUBLIC_CHECKOUT_PENDING_URL ||
    getFullUrl("checkout/pending"),
};

/**
 * URL del Webhook para notificaciones de Mercado Pago
 */
export const WEBHOOK_URL =
  process.env.MERCADOPAGO_WEBHOOK_URL || getFullUrl("api/checkout/webhook");

/**
 * URL Base del sitio
 */
export const SITE_URL = getBaseUrl();

// Debug logging (solo en desarrollo)
if (process.env.NODE_ENV === "development") {
  console.log("[URL Config]", {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL || "undefined",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "undefined",
    baseUrl: getBaseUrl(),
    checkoutUrls: CHECKOUT_URLS,
    webhookUrl: WEBHOOK_URL,
  });
}
