"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WhatsAppButton } from "@/components/productos/WhatsAppButton";
import { BUTTONS, CART_LAYOUT } from "@/lib/design/tokens";
import { formatPrice } from "@/lib/utils";
import { ProductoCompleto } from "@/lib/types";

interface ProductActionsProps {
  producto: ProductoCompleto;
}

/**
 * ProductActions - Wrapper Client Component
 *
 * Renderiza acciones publicas de consulta para el catalogo.
 *
 * @param producto - Información del producto
 */
export function ProductActions({ producto }: ProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const variations = useMemo(
    () => producto.variaciones || [],
    [producto.variaciones],
  );
  const sizes = useMemo(
    () => [...new Set(variations.map((variation) => variation.tamanio))],
    [variations],
  );
  const colors = useMemo(
    () => [...new Set(variations.map((variation) => variation.color))],
    [variations],
  );
  const resolvedSelectedSize =
    selectedSize ?? (sizes.length === 1 ? sizes[0] : null);
  const resolvedSelectedColor =
    selectedColor ?? (colors.length === 1 ? colors[0] : null);

  const variation = variations.find((currentVariation) => {
    const sizeMatch = resolvedSelectedSize
      ? currentVariation.tamanio === resolvedSelectedSize
      : sizes.length === 0;
    const colorMatch = resolvedSelectedColor
      ? currentVariation.color === resolvedSelectedColor
      : colors.length === 0;

    return sizeMatch && colorMatch;
  });

  const hasVariations = sizes.length > 0 || colors.length > 0;
  const hasAnyStock = variations.some(
    (currentVariation) => currentVariation.stock > 0,
  );
  const displayPrice = variation?.precio ?? producto.precio_desde;

  let availabilityLabel = "Disponibilidad sujeta a consulta";
  if (variation) {
    availabilityLabel =
      variation.stock > 0
        ? `${variation.stock} disponible${variation.stock === 1 ? "" : "s"}`
        : "Sin stock inmediato";
  } else if (!hasVariations && hasAnyStock) {
    availabilityLabel = "Disponibilidad sujeta a consulta";
  } else if (!hasAnyStock) {
    availabilityLabel = "Consultar disponibilidad";
  }

  return (
    <div
      className={
        CART_LAYOUT.container +
        " space-y-6 rounded-lg border border-border bg-muted/30 p-6"
      }
    >
      {displayPrice != null && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {variation ? "Precio de esta variante" : "Precio de referencia"}
          </p>
          <p className="text-3xl font-bold">{formatPrice(displayPrice)}</p>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Tamaño</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = resolvedSelectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={isSelected}
                  className={isSelected ? BUTTONS.primary : BUTTONS.secondary}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = resolvedSelectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-pressed={isSelected}
                  className={isSelected ? BUTTONS.primary : BUTTONS.secondary}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-border/70 bg-white/80 p-4">
        <p className="text-sm font-semibold text-foreground">Disponibilidad</p>
        <p className="text-sm text-muted-foreground">{availabilityLabel}</p>
        <p className="text-sm text-muted-foreground">
          Confirmamos disponibilidad, variantes y tiempos de entrega de forma
          manual.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <WhatsAppButton producto={producto} variacion={variation} />
        </div>
        <Link
          href="/productos"
          className={BUTTONS.secondary + " flex-1 text-center"}
        >
          Ver más productos
        </Link>
      </div>
    </div>
  );
}
