import Image from "next/image";
import { ImagenProducto } from "@/lib/types";
import { STORAGE } from "@/lib/constants";

interface ProductGalleryProps {
  imagenes: ImagenProducto[];
}

/**
 * ProductGallery - Galería de imágenes de producto
 *
 * V1: Versión simple que muestra solo la imagen principal
 * V2 (futuro): Thumbnails y carousel para múltiples imágenes
 *
 * @param imagenes - Array de imágenes del producto
 */
export function ProductGallery({ imagenes }: ProductGalleryProps) {
  // Buscar imagen principal
  const imagenPrincipal = imagenes.find((img) => img.es_principal);

  // Si no hay principal, usar la primera disponible
  const imagenAMostrar = imagenPrincipal || imagenes[0];

  // Si no hay ninguna imagen, usar placeholder
  const imageUrl = imagenAMostrar?.url || STORAGE.productPlaceholder;
  const altText = imagenAMostrar?.alt_text || "Imagen del producto";

  return (
    <div
      className="
      relative w-full aspect-square
      rounded-lg border border-border
      overflow-hidden
      bg-background
    "
    >
      <Image
        src={imageUrl}
        alt={altText}
        width={800}
        height={800}
        priority
        className="object-cover"
      />
    </div>
  );
}
