"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Producto, Variacion } from "@/lib/types";
import { WHATSAPP } from "@/lib/constants";
import { buildProductInquiryMessage } from "@/lib/contact/whatsapp";
import { trackProductInquiry } from "@/lib/analytics/gtag";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  producto: Producto;
  variacion?: Variacion;
}

export function buildContactFallbackHref(
  producto: Producto,
  variacion?: Variacion,
): string {
  const params = new URLSearchParams({ producto: producto.nombre });

  if (variacion) {
    params.set("variante", `${variacion.tamanio} / ${variacion.color}`);
  }

  return `/contacto?${params.toString()}`;
}

/**
 * WhatsAppButton - Botón para consultar por WhatsApp
 *
 * Genera un mensaje pre-formateado con la información del producto
 * y lo abre en una nueva pestaña de WhatsApp
 *
 * @param producto - Producto sobre el que se consulta
 * @param variacion - Variación seleccionada (opcional)
 */
export function WhatsAppButton({ producto, variacion }: WhatsAppButtonProps) {
  const whatsappUrl = WHATSAPP.getUrl(
    buildProductInquiryMessage(producto, variacion),
  );

  const handleClick = () => {
    // Track product inquiry intent without sending the message body.
    trackProductInquiry(producto, variacion, "whatsapp");
  };

  if (!whatsappUrl) {
    return (
      <div className="space-y-2">
        <Link
          href={buildContactFallbackHref(producto, variacion)}
          className={cn(
            "group inline-flex w-full items-center justify-center gap-3",
            "rounded-xl bg-foreground px-8 py-4 text-base font-semibold text-background shadow-lg",
            "transition-all duration-300 hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
          )}
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span>Consultar por este producto</span>
        </Link>
        <p className="text-center text-sm text-muted-foreground" role="status">
          WhatsApp no está configurado. Podés consultar desde contacto.
        </p>
      </div>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center justify-center gap-3 w-full",
        "px-8 py-4 rounded-xl font-semibold text-base shadow-lg",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white hover:shadow-xl hover:scale-[1.02] focus:ring-green-500",
      )}
    >
      <MessageCircle
        className="w-5 h-5 motion-safe:transition-transform motion-safe:group-hover:rotate-12"
        aria-hidden="true"
      />
      <span>Consultar por este producto</span>
    </a>
  );
}
