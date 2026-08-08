import Link from "next/link";
import type { ProductoCompleto } from "@/lib/types";
import { ERROR_MESSAGES } from "@/lib/constants";
import { getPrincipalImage } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  productos: ProductoCompleto[];
}

export function ProductGrid({ productos }: ProductGridProps) {
  // Manejo de estado vacío
  if (productos.length === 0) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          flex-col
          items-center
          justify-center
          gap-4
          rounded-lg
          border border-border
          bg-muted/30
          p-8
          text-center
        "
      >
        <p className="text-lg text-muted-foreground">
          {ERROR_MESSAGES.noProducts}
        </p>
        <Link
          href="/productos"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
        >
          Ver todos los productos
        </Link>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {productos.map((producto) => {
        // Extraer imagen principal
        const imagenPrincipal = getPrincipalImage(producto.imagenes);

        return (
          <ProductCard
            key={producto.id}
            producto={producto}
            imagenPrincipal={imagenPrincipal?.url}
            imagenAlt={imagenPrincipal?.alt_text}
          />
        );
      })}
    </div>
  );
}
