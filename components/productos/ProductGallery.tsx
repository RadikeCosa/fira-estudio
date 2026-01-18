"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagenProducto } from "@/lib/types";
import { STORAGE } from "@/lib/constants";

interface ProductGalleryProps {
  imagenes: ImagenProducto[];
}

/**
 * ProductGallery - Galería de imágenes de producto con carrusel interactivo
 *
 * Características:
 * - Navegación con botones y teclado (flechas)
 * - Thumbnails clickeables con scroll horizontal
 * - Contador de imagen actual
 * - Responsive design mobile-first
 * - Optimización de imágenes (priority para principal, lazy para thumbnails)
 *
 * @param imagenes - Array de imágenes del producto ordenadas
 */
export function ProductGallery({ imagenes }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Si no hay imágenes, crear array con placeholder
  const imagenesAMostrar: ImagenProducto[] =
    imagenes.length > 0
      ? imagenes
      : [
          {
            id: "placeholder",
            producto_id: "",
            url: STORAGE.productPlaceholder,
            alt_text: "Imagen del producto",
            orden: 0,
            es_principal: true,
          },
        ];

  const imagenActual = imagenesAMostrar[currentIndex];
  const totalImagenes = imagenesAMostrar.length;
  const hayMultiplesImagenes = totalImagenes > 1;

  /**
   * Navega a la imagen anterior
   */
  const handlePrevious = (): void => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  /**
   * Navega a la imagen siguiente
   */
  const handleNext = (): void => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalImagenes - 1));
  };

  /**
   * Navega a una imagen específica al hacer click en thumbnail
   */
  const handleThumbnailClick = (index: number): void => {
    setCurrentIndex(index);
  };

  /**
   * Maneja la navegación con teclado (flechas izquierda/derecha)
   */
  useEffect(() => {
    if (!hayMultiplesImagenes) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(prev + 1, totalImagenes - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hayMultiplesImagenes, totalImagenes]);

  return (
    <div className="space-y-4 w-full">
      {/* Imagen principal con controles de navegación */}
      <div
        className="
          relative
          w-full
          aspect-square
          rounded-2xl
          border border-border/50
          overflow-hidden
          bg-gradient-to-br from-muted/30 to-muted
          shadow-lg
        "
      >
        <Image
          src={imagenActual.url}
          alt={imagenActual.alt_text || "Imagen del producto"}
          width={800}
          height={800}
          priority
          sizes="(max-width: 768px) 100vw, 800px"
          className="
            object-cover
            w-full
            h-full
          "
        />

        {/* Botones de navegación - Solo si hay múltiples imágenes */}
        {hayMultiplesImagenes && (
          <>
            {/* Botón Anterior */}
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Imagen anterior"
              className="
                absolute
                left-4
                top-1/2
                transform
                -translate-y-1/2
                p-3
                rounded-full
                bg-white/80
                backdrop-blur-sm
                hover:bg-white
                transition-all
                shadow-lg
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:outline-none
                focus:ring-2
                focus:ring-foreground
                focus:ring-offset-2
              "
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>

            {/* Botón Siguiente */}
            <button
              onClick={handleNext}
              disabled={currentIndex === totalImagenes - 1}
              aria-label="Imagen siguiente"
              className="
                absolute
                right-4
                top-1/2
                transform
                -translate-y-1/2
                p-3
                rounded-full
                bg-white/80
                backdrop-blur-sm
                hover:bg-white
                transition-all
                shadow-lg
                disabled:opacity-50
                disabled:cursor-not-allowed
                focus:outline-none
                focus:ring-2
                focus:ring-foreground
                focus:ring-offset-2
              "
            >
              <ChevronRight className="h-6 w-6 text-foreground" />
            </button>

            {/* Contador de imágenes */}
            <div
              className="
                absolute
                bottom-4
                left-1/2
                transform
                -translate-x-1/2
                px-3
                py-1.5
                rounded-full
                bg-black/50
                text-white
                text-sm
                font-medium
                backdrop-blur-sm
              "
              aria-live="polite"
              aria-atomic="true"
            >
              {currentIndex + 1} / {totalImagenes}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails - Solo si hay múltiples imágenes */}
      {hayMultiplesImagenes && (
        <div
          className="
            grid
            grid-cols-4
            sm:grid-cols-4
            md:grid-cols-4
            lg:grid-cols-5
            gap-2
            overflow-x-auto
          "
          role="tablist"
          aria-label="Miniaturas de imágenes"
        >
          {imagenesAMostrar.map((imagen, index) => (
            <button
              key={imagen.id}
              onClick={() => handleThumbnailClick(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Ver imagen ${index + 1}`}
              className={`
                relative
                aspect-square
                rounded-lg
                overflow-hidden
                border-2
                transition-all
                focus:outline-none
                focus:ring-2
                focus:ring-foreground
                focus:ring-offset-2
                ${
                  index === currentIndex
                    ? "border-foreground ring-2 ring-foreground ring-offset-2"
                    : "border-transparent hover:border-border"
                }
              `}
            >
              <Image
                src={imagen.url}
                alt={imagen.alt_text || `Miniatura ${index + 1}`}
                width={200}
                height={200}
                loading="lazy"
                sizes="200px"
                className="
                  object-cover
                  w-full
                  h-full
                "
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
