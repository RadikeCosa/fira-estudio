"use client";

import { MessageCircle } from "lucide-react";
import { Producto, Variacion } from "@/lib/types";
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";
import { trackWhatsAppClick } from "@/lib/analytics/gtag";

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
 * @param producto - Producto sobre el que se consulta
 * @param variacion - Variación seleccionada (opcional)
 */
export function WhatsAppButton({ producto, variacion }: WhatsAppButtonProps) {
  // Formatear precio
  const formatearPrecio = (precio: number): string => {
    return precio.toLocaleString("es-AR");
  };

  // Construir mensaje pre-formateado
  const construirMensaje = (): string => {
    let mensaje = `Hola! Me interesa este producto de ${SITE_CONFIG.name}: `;
    mensaje += `${producto.nombre}`;

    if (variacion) {
      mensaje += ` - Tamaño: ${variacion.tamanio}`;
      mensaje += `, Color: ${variacion.color}`;
      mensaje += `, Precio: $${formatearPrecio(variacion.precio)}`;
    }

    mensaje += `. ¿Podrías darme más información?`;

    return mensaje;
  };

  const whatsappUrl = WHATSAPP.getUrl(construirMensaje());

  const handleClick = () => {
    // Track WhatsApp button click
    trackWhatsAppClick(producto, variacion);
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="
        group
        inline-flex items-center justify-center gap-3
        w-full
        px-8 py-4 rounded-xl
        bg-gradient-to-r from-green-600 to-green-500
        hover:from-green-700 hover:to-green-600
        text-white font-semibold text-base
        shadow-lg
        transition-all duration-300
        hover:shadow-xl
        hover:scale-[1.02]
        focus:outline-none
        focus:ring-2
        focus:ring-green-500
        focus:ring-offset-2
      "
    >
      <MessageCircle className="w-5 h-5 motion-safe:transition-transform motion-safe:group-hover:rotate-12" />
      <span>Consultar por WhatsApp</span>
    </a>
  );
}
