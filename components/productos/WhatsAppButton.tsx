import { MessageCircle } from "lucide-react";
import { Producto, Variacion } from "@/lib/types";
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";

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

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center justify-center gap-2
        w-full md:w-auto
        px-6 py-3 rounded-lg
        bg-green-600 hover:bg-green-700
        text-white font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      "
    >
      <MessageCircle className="w-5 h-5" />
      <span>Consultar por WhatsApp</span>
    </a>
  );
}
