"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WhatsAppButton } from "@/components/productos/WhatsAppButton";
import { BUTTONS, CART_LAYOUT } from "@/lib/design/tokens";
import { formatPrice } from "@/lib/utils";
import type { ProductoCompleto } from "@/lib/types";

interface ProductActionsProps {
  producto: ProductoCompleto;
}

function buildOptionId(prefix: string, value: string): string {
  return `${prefix}-${value.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
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
  const activeVariations = useMemo(
    () => variations.filter((variation) => variation.activo),
    [variations],
  );
  const sizes = useMemo(
    () => [...new Set(variations.map((variation) => variation.tamanio))],
    [variations],
  );
  const colors = useMemo(
    () => [...new Set(variations.map((variation) => variation.color))],
    [variations],
  );
  const activeSizes = useMemo(
    () => [...new Set(activeVariations.map((variation) => variation.tamanio))],
    [activeVariations],
  );
  const activeColors = useMemo(
    () => [...new Set(activeVariations.map((variation) => variation.color))],
    [activeVariations],
  );
  const resolvedSelectedSize =
    selectedSize ?? (activeSizes.length === 1 ? activeSizes[0] : null);
  const resolvedSelectedColor =
    selectedColor ?? (activeColors.length === 1 ? activeColors[0] : null);

  const variation = activeVariations.find((currentVariation) => {
    const sizeMatch = resolvedSelectedSize
      ? currentVariation.tamanio === resolvedSelectedSize
      : sizes.length === 0;
    const colorMatch = resolvedSelectedColor
      ? currentVariation.color === resolvedSelectedColor
      : colors.length === 0;

    return sizeMatch && colorMatch;
  });

  const displayPrice = variation?.precio ?? producto.precio_desde;
  const radioGroupName = `product-${producto.id}`;

  const isSizeSelectable = (size: string): boolean =>
    activeVariations.some(
      (currentVariation) =>
        currentVariation.tamanio === size &&
        (!resolvedSelectedColor ||
          currentVariation.color === resolvedSelectedColor),
    );

  const isColorSelectable = (color: string): boolean =>
    activeVariations.some(
      (currentVariation) =>
        currentVariation.color === color &&
        (!resolvedSelectedSize ||
          currentVariation.tamanio === resolvedSelectedSize),
    );

  const handleSizeChange = (size: string): void => {
    setSelectedSize(size);
    if (
      selectedColor &&
      !activeVariations.some(
        (currentVariation) =>
          currentVariation.tamanio === size &&
          currentVariation.color === selectedColor,
      )
    ) {
      setSelectedColor(null);
    }
  };

  const handleColorChange = (color: string): void => {
    setSelectedColor(color);
    if (
      selectedSize &&
      !activeVariations.some(
        (currentVariation) =>
          currentVariation.color === color &&
          currentVariation.tamanio === selectedSize,
      )
    ) {
      setSelectedSize(null);
    }
  };

  const availabilityLabel = variation
    ? "Disponibilidad a consultar para esta variante"
    : "Disponibilidad a consultar";

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
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Tamaño</legend>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Tamaño"
          >
            {sizes.map((size) => {
              const isSelected = resolvedSelectedSize === size;
              const isDisabled = !isSizeSelectable(size);
              const id = buildOptionId(`${radioGroupName}-size`, size);

              return (
                <label
                  key={size}
                  htmlFor={id}
                  className={
                    (isSelected ? BUTTONS.primary : BUTTONS.secondary) +
                    " inline-flex cursor-pointer items-center gap-2 focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2 focus-within:ring-offset-background" +
                    (isDisabled
                      ? " cursor-not-allowed opacity-50"
                      : " hover:border-foreground/60")
                  }
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${radioGroupName}-size`}
                    value={size}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleSizeChange(size)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={
                      "h-2.5 w-2.5 rounded-full border border-current " +
                      (isSelected ? "bg-current" : "bg-transparent")
                    }
                  />
                  {size}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {colors.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Color</legend>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Color"
          >
            {colors.map((color) => {
              const isSelected = resolvedSelectedColor === color;
              const isDisabled = !isColorSelectable(color);
              const id = buildOptionId(`${radioGroupName}-color`, color);

              return (
                <label
                  key={color}
                  htmlFor={id}
                  className={
                    (isSelected ? BUTTONS.primary : BUTTONS.secondary) +
                    " inline-flex cursor-pointer items-center gap-2 focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-offset-2 focus-within:ring-offset-background" +
                    (isDisabled
                      ? " cursor-not-allowed opacity-50"
                      : " hover:border-foreground/60")
                  }
                >
                  <input
                    id={id}
                    type="radio"
                    name={`${radioGroupName}-color`}
                    value={color}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleColorChange(color)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={
                      "h-2.5 w-2.5 rounded-full border border-current " +
                      (isSelected ? "bg-current" : "bg-transparent")
                    }
                  />
                  {color}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="space-y-2 rounded-lg border border-border/70 bg-surface/80 p-4">
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
