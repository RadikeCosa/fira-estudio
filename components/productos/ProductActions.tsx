"use client";

import { ProductoCompleto } from "@/lib/types";
import { AddToCartButton } from "@/components/carrito/AddToCartButton";

interface ProductActionsProps {
  producto: ProductoCompleto;
}

/**
 * ProductActions - Wrapper Client Component
 *
 * Renderiza acciones de compra basadas en carrito
 *
 * @param producto - Información del producto
 */
export function ProductActions({ producto }: ProductActionsProps) {
  return (
    <div className="space-y-6">
      {/* Botón de agregar al carrito */}
      <AddToCartButton producto={producto} />
    </div>
  );
}
