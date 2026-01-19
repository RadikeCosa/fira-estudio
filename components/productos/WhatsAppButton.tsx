"use client";

import { MessageCircle } from "lucide-react";
import { Producto, Variacion } from "@/lib/types";
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { trackWhatsAppClick } from "@/lib/analytics/gtag";
import { useRateLimit } from "@/hooks/useRateLimit";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  producto: Producto;
  variacion?: Variacion;
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
  
  // Construir mensaje pre-formateado
  const construirMensaje = (): string => {
    let mensaje = `Hola! Me interesa este producto de ${SITE_CONFIG.name}: `;
    mensaje += `${producto.nombre}`;

    if (variacion) {
      mensaje += ` - Tamaño: ${variacion.tamanio}`;
      mensaje += `, Color: ${variacion.color}`;
      mensaje += `, Precio: ${formatPrice(variacion.precio)}`;
      
      // Agregar pregunta según disponibilidad de stock
      if (variacion.stock === 0) {
        mensaje += `. ¿Cuál es el tiempo de fabricación?`;
      } else {
        mensaje += `. ¿Está disponible para envío inmediato?`;
      }
    } else {
      mensaje += `. ¿Podrías darme más información?`;
    }

    return mensaje;
  };

  const whatsappUrl = WHATSAPP.getUrl(construirMensaje());

  const handleClick = (e: React.MouseEvent) => {
    // Check rate limit
    if (isRateLimited) {
      e.preventDefault();
      const seconds = Math.ceil(timeUntilReset / 1000);
      // Note: Consider replacing with toast notification for better UX
      // For now, using alert() for simplicity (no dependencies required)
      alert(
        `Por favor, esperá un momento antes de volver a consultar.\nDisponible en ${seconds} segundo${seconds !== 1 ? "s" : ""}.`
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
        `Por favor, esperá un momento antes de volver a consultar.\nDisponible en ${seconds} segundo${seconds !== 1 ? "s" : ""}.`
      );
      return;
    }

    // Track WhatsApp button click
    trackWhatsAppClick(producto, variacion);
  };

  // Format countdown message
  const getButtonText = (): string => {
    if (isRateLimited && timeUntilReset > 0) {
      const seconds = Math.ceil(timeUntilReset / 1000);
      return `Disponible en ${seconds}s`;
    }
    return "Consultar por WhatsApp";
  };

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
          ? "bg-gradient-to-r from-gray-400 to-gray-300 cursor-not-allowed text-white focus:ring-gray-400"
          : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white hover:shadow-xl hover:scale-[1.02] focus:ring-green-500"
      )}
      aria-disabled={isRateLimited}
    >
      <MessageCircle
        className={cn(
          "w-5 h-5",
          !isRateLimited && "motion-safe:transition-transform motion-safe:group-hover:rotate-12"
        )}
      />
      <span>{getButtonText()}</span>
    </a>
  );
}
