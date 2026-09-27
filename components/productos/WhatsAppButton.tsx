"use client";

import { Instagram, Mail, MessageCircle } from "lucide-react";
import type { Producto, Variacion } from "@/lib/types";
import { WHATSAPP } from "@/lib/constants";
import { PUBLIC_CONTACT_CHANNELS, SOCIAL_LINKS } from "@/lib/constants/navigation";
import { buildProductInquiryMessage } from "@/lib/contact/whatsapp";
import { trackProductInquiry } from "@/lib/analytics/gtag";
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
    const email = PUBLIC_CONTACT_CHANNELS.emailAddress;
    const instagram = SOCIAL_LINKS.instagram.href;

    return (
      <div className="space-y-4 rounded-md border border-border bg-surface p-5">
        <p className="text-sm leading-relaxed text-muted-foreground" role="status">
          WhatsApp no está disponible para consultar por {producto.nombre}
          {variacion ? ` · ${variacion.tamanio} / ${variacion.color}` : ""}.
        </p>
        {(email || instagram) && (
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium">
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-11 items-center gap-2 text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Consultar por email
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Consultar por Instagram
              </a>
            )}
          </div>
        )}
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
        "min-h-12 px-6 py-3 rounded-md font-semibold text-base",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
        "bg-accent text-accent-foreground hover:bg-accent-hover focus:ring-focus-ring",
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
