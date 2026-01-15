import { ProductoCompleto } from "@/lib/types";

interface ProductInfoProps {
  producto: ProductoCompleto;
}

/**
 * ProductInfo - Información detallada del producto
 *
 * Muestra nombre, categoría, descripción y detalles técnicos
 *
 * @param producto - Producto completo con todas sus relaciones
 */
export function ProductInfo({ producto }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Categoría */}
      {producto.categoria && (
        <div className="inline-block">
          <span
            className="
            px-3 py-1 rounded-full
            bg-accent/10 text-accent
            text-sm font-medium
          "
          >
            {producto.categoria.nombre}
          </span>
        </div>
      )}

      {/* Título */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
        {producto.nombre}
      </h1>

      {/* Descripción */}
      <p className="text-lg text-accent leading-relaxed">
        {producto.descripcion}
      </p>

      {/* Detalles del producto */}
      <div
        className="
        pt-6 space-y-4
        border-t border-border
      "
      >
        {/* Tiempo de fabricación */}
        <div className="flex gap-3">
          <span className="text-sm font-medium text-accent min-w-[120px]">
            Tiempo de entrega:
          </span>
          <span className="text-sm text-foreground">
            {producto.tiempo_fabricacion}
          </span>
        </div>

        {/* Material (solo si existe) */}
        {producto.material && (
          <div className="flex gap-3">
            <span className="text-sm font-medium text-accent min-w-[120px]">
              Material:
            </span>
            <span className="text-sm text-foreground">{producto.material}</span>
          </div>
        )}

        {/* Cuidados (solo si existe) */}
        {producto.cuidados && (
          <div className="flex gap-3">
            <span className="text-sm font-medium text-accent min-w-[120px]">
              Cuidados:
            </span>
            <span className="text-sm text-foreground">{producto.cuidados}</span>
          </div>
        )}
      </div>
    </div>
  );
}
