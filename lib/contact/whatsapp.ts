import type { Producto, Variacion } from "@/lib/types";

const WHATSAPP_NUMBER_PATTERN = /^\d+$/;

export function getWhatsappNumber(): string | undefined {
  const trimmed = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();

  if (!trimmed || !WHATSAPP_NUMBER_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function buildWhatsappUrl(message: string): string | null {
  const number = getWhatsappNumber();
  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralInquiryMessage(): string {
  return "Hola, quería hacer una consulta sobre los productos de Fira Estudio.";
}

export function buildProductInquiryMessageFromParts(
  productName: string,
  variantLabel?: string,
): string {
  const variantText = variantLabel ? `, variante ${variantLabel}` : "";

  return `Hola, quería consultar por ${productName}${variantText}. ¿Está disponible?`;
}

export function buildProductInquiryMessage(
  producto: Pick<Producto, "nombre">,
  variacion?: Pick<Variacion, "tamanio" | "color">,
): string {
  const variantLabel = variacion
    ? `${variacion.tamanio} / ${variacion.color}`
    : undefined;

  return buildProductInquiryMessageFromParts(producto.nombre, variantLabel);
}
