import type { Variacion } from "@/lib/types";

interface StockBadgeProps {
  variacion: Variacion;
  className?: string;
}

/**
 * StockBadge - Badge de disponibilidad de stock
 *
 * Muestra el estado de stock de una variación con colores semánticos:
 * - Verde: Stock > 3 (disponible)
 * - Naranja: Stock 1-3 (pocas unidades)
 * - Amarillo: Stock = 0 y activo (a pedido)
 * - Rojo: No activo (no disponible)
 *
 * @param variacion - Variación del producto
 * @param className - Clases CSS adicionales
 */
export function StockBadge({ variacion, className = "" }: StockBadgeProps) {
  // Determinar el estado y estilo del badge
  const getBadgeConfig = () => {
    if (!variacion.activo) {
      return {
        text: "No disponible",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-700/20",
        dotColor: "bg-red-500",
      };
    }

    if (variacion.stock === 0) {
      return {
        text: "A pedido",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-700/20",
        dotColor: "bg-yellow-500",
      };
    }

    if (variacion.stock <= 3) {
      return {
        text: `¡Solo quedan ${variacion.stock}!`,
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        borderColor: "border-orange-700/20",
        dotColor: "bg-orange-500",
      };
    }

    return {
      text: `${variacion.stock} disponibles`,
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-700/20",
      dotColor: "bg-green-500",
    };
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`
        inline-flex items-center gap-2
        px-4 py-2
        rounded-full
        ${config.bgColor}
        border ${config.borderColor}
        ${className}
      `}
    >
      <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
      <p className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </p>
    </div>
  );
}
