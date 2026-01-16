import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { STORAGE } from "@/lib/constants";

interface ProductCardProps {
  producto: Producto;
  imagenPrincipal?: string;
}

export function ProductCard({ producto, imagenPrincipal }: ProductCardProps) {
  const imageSrc = imagenPrincipal || STORAGE.productPlaceholder;
  const precioFormateado = producto.precio_desde
    ? `Desde $${producto.precio_desde.toLocaleString("es-AR")}`
    : null;

  return (
    <Link
      href={`/productos/${producto.slug}`}
      className="
        group
        relative
        block
        overflow-hidden
        rounded-2xl
        border border-border/50
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:shadow-xl
        hover:border-foreground/10
        hover:-translate-y-1
      "
    >
      {/* Badge Destacado */}
      {producto.destacado && (
        <div
          className="
            absolute
            top-4
            right-4
            z-10
            rounded-full
            bg-foreground
            px-4
            py-1.5
            text-xs
            font-semibold
            text-background
            shadow-lg
            backdrop-blur-sm
          "
        >
          Destacado
        </div>
      )}

      {/* Imagen del Producto */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted">
        <Image
          src={imageSrc}
          alt={`${producto.nombre} - Textil artesanal de Muma Estudio`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="
            object-cover
            transition-all
            duration-500
            group-hover:scale-110
          "
          loading="lazy"
        />
        {/* Gradient overlay on hover */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/10 via-transparent to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />
      </div>

      {/* Información del Producto */}
      <div className="p-5">
        <h3
          className="
            mb-2
            text-lg
            font-bold
            text-foreground
            transition-colors
            duration-300
            group-hover:text-foreground/90
          "
        >
          {producto.nombre}
        </h3>

        {precioFormateado && (
          <p className="text-sm font-semibold text-muted-foreground">{precioFormateado}</p>
        )}
      </div>
    </Link>
  );
}
