import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { formatPrice, getImageUrl, getProductImageAlt } from "@/lib/utils";

interface ProductCardProps {
  producto: Producto;
  imagenPrincipal?: string;
  imagenAlt?: string | null;
}

export function ProductCard({
  producto,
  imagenPrincipal,
  imagenAlt,
}: ProductCardProps) {
  const imageSrc = getImageUrl(imagenPrincipal);
  const imageAlt = getProductImageAlt(producto.nombre, imagenAlt);
  const precioFormateado =
    producto.precio_desde != null
      ? `Desde ${formatPrice(producto.precio_desde)}`
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
          alt={imageAlt}
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
          <p className="text-sm font-semibold text-muted-foreground">
            {precioFormateado}
          </p>
        )}
      </div>
    </Link>
  );
}
