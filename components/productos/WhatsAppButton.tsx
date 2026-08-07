"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Producto, Variacion } from "@/lib/types";
import { WHATSAPP } from "@/lib/constants";
import { trackProductInquiry } from "@/lib/analytics/gtag";
import { useRateLimit } from "@/hooks/useRateLimit";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  producto: Producto;
  variacion?: Variacion;
}

export function buildProductInquiryMessage(
  producto: Producto,
  variacion?: Variacion,
): string {
  const variantLabel = variacion
    ? `, variante ${variacion.tamanio} / ${variacion.color}`
    : "";

  return `Hola, quería consultar por ${producto.nombre}${variantLabel}. ¿Está disponible para coordinar?`;
}

/**
 * WhatsAppButton - Botón para consultar por WhatsApp
 *
 * Genera un mensaje pre-formateado con la información del producto
 * y lo abre en una nueva pestaña de WhatsApp
 *
 * Incluye rate limiting: máximo 5 clicks por minuto
 *
 * @param producto - Producto sobre el que se consulta
 * @param variacion - Variación seleccionada (opcional)
 */
export function WhatsAppButton({ producto, variacion }: WhatsAppButtonProps) {
  // Rate limiting: 5 clicks per minute
  const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
    maxActions: 5,
    windowMs: 60000,
    key: "whatsapp_clicks",
  });

  const whatsappUrl = WHATSAPP.getUrl(
    buildProductInquiryMessage(producto, variacion),
  );

  const handleClick = (e: React.MouseEvent) => {
    // Check rate limit
    if (isRateLimited) {
      e.preventDefault();
      const seconds = Math.ceil(timeUntilReset / 1000);
      // Note: Consider replacing with toast notification for better UX
      // For now, using alert() for simplicity (no dependencies required)
      alert(
        `Por favor, esperá un momento antes de volver a consultar.\nDisponible en ${seconds} segundo${seconds !== 1 ? "s" : ""}.`,
      );
      return;
    }

    // Record the action
    const success = recordAction();

    // Double-check if we just hit the limit
    if (!success || isRateLimited) {
      e.preventDefault();
      const seconds = Math.ceil(timeUntilReset / 1000);
      alert(
        `Por favor, esperá un momento antes de volver a consultar.\nDisponible en ${seconds} segundo${seconds !== 1 ? "s" : ""}.`,
      );
      return;
    }

    // Track product inquiry intent without sending the message body.
    trackProductInquiry(producto, variacion, "whatsapp");
  };

  // Format countdown message
  const getButtonText = (): string => {
    if (isRateLimited && timeUntilReset > 0) {
      const seconds = Math.ceil(timeUntilReset / 1000);
      return `Disponible en ${seconds}s`;
    }
    return "Consultar por este producto";
  };

  if (!whatsappUrl) {
    return (
      <div className="space-y-2">
        <Link
          href="/contacto"
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
        isRateLimited
          ? "bg-linear-to-r from-gray-400 to-gray-300 cursor-not-allowed text-white focus:ring-gray-400"
          : "bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white hover:shadow-xl hover:scale-[1.02] focus:ring-green-500",
      )}
      aria-disabled={isRateLimited}
    >
      <MessageCircle
        className={cn(
          "w-5 h-5",
          !isRateLimited &&
            "motion-safe:transition-transform motion-safe:group-hover:rotate-12",
        )}
        aria-hidden="true"
      />
      <span>{getButtonText()}</span>
    </a>
  );
}
