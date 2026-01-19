import { Badge } from "@/components/ui/Badge";
import type { Variacion } from "@/lib/types";
import { STOCK_THRESHOLDS } from "@/lib/constants";

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
  const getBadgeConfig = () => {
    if (variacion.stock === -1) {
      return { variant: 'error' as const, text: "Agotado" };
    }
    if (!variacion.activo) {
      return { variant: 'error' as const, text: "No disponible" };
    }
    if (variacion.stock === 0) {
      return { variant: 'info' as const, text: "A pedido" };
    }
    if (variacion.stock <= STOCK_THRESHOLDS.lowStock) {
      return { variant: 'warning' as const, text: `¡Solo quedan ${variacion.stock}!` };
    }
    return { variant: 'success' as const, text: `${variacion.stock} disponibles` };
  };
  
  const config = getBadgeConfig();
  
  return (
    <Badge variant={config.variant} showDot className={className}>
      {config.text}
    </Badge>
  );
}
