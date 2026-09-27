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
            px-4 py-2 rounded-full
            bg-muted/50
            border border-border/50
            text-foreground/80
            text-sm font-semibold
            transition-all
            duration-200
            hover:bg-muted
          "
          >
            {producto.categoria.nombre}
          </span>
        </div>
      )}

      {/* Título */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
        {producto.nombre}
      </h1>

      {/* Descripción */}
      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
        {producto.descripcion}
      </p>

      {/* Detalles del producto */}
      <div
        className="
        pt-6 space-y-4
        border-t-2 border-border/50
      "
      >
        {/* Tiempo de fabricación */}
        <div className="flex gap-4">
          <span className="text-sm font-semibold text-foreground min-w-[140px]">
            Tiempo de entrega:
          </span>
          <span className="text-sm text-muted-foreground">
            {producto.tiempo_fabricacion}
          </span>
        </div>

        {/* Material (solo si existe) */}
        {producto.material && (
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-foreground min-w-[140px]">
              Material:
            </span>
            <span className="text-sm text-muted-foreground">{producto.material}</span>
          </div>
        )}

        {/* Cuidados (solo si existe) */}
        {producto.cuidados && (
          <div className="flex gap-4">
            <span className="text-sm font-semibold text-foreground min-w-[140px]">
              Cuidados:
            </span>
            <span className="text-sm text-muted-foreground">{producto.cuidados}</span>
          </div>
        )}
      </div>
    </div>
  );
}
