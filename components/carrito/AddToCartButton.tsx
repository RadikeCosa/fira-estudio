"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductoCompleto } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/app/api/cart/actions";
import { ShoppingCart } from "lucide-react";
import {
  IS_MAINTENANCE_MODE,
  IS_CHECKOUT_ENABLED,
} from "@/lib/config/features";

interface AddToCartButtonProps {
  producto: ProductoCompleto;
}

export function AddToCartButton({ producto }: AddToCartButtonProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Obtener variaciones únicas por tamaño y color
  const variations = producto.variaciones || [];
  const sizes = [...new Set(variations.map((v) => v.tamanio))];
  const colors = [...new Set(variations.map((v) => v.color))];

  useEffect(() => {
    if (sizes.length === 1 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
  }, [sizes, colors, selectedSize, selectedColor]);

  // Obtener variación seleccionada por tamaño y color
  const variation = variations.find((v) => {
    const sizeMatch = selectedSize
      ? v.tamanio === selectedSize
      : sizes.length === 0;
    const colorMatch = selectedColor
      ? v.color === selectedColor
      : colors.length === 0;
    return sizeMatch && colorMatch;
  });

  // Verificar si hay stock suficiente
  const maxStock = variation?.stock ?? 0;
  const hasEnoughStock = variation ? maxStock >= quantity : false;

  // Verificar si el checkout está habilitado
  const isCheckoutDisabled = IS_MAINTENANCE_MODE || !IS_CHECKOUT_ENABLED;

  const handleAddToCart = async () => {
    if (isCheckoutDisabled) {
      setError("El checkout está temporalmente deshabilitado");
      return;
    }

    if (!variation) {
      setError("Por favor selecciona tamaño y color");
      return;
    }

    if (!hasEnoughStock) {
      setError("No hay stock suficiente");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addToCart(variation.id, quantity, variation.precio || 0);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCart = () => {
    router.push("/carrito");
  };

  return (
    <div className="space-y-6 bg-muted/30 border border-border rounded-lg p-6">
      {/* Precio */}
      {variation && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Precio</p>
          <p className="text-3xl font-bold">{formatPrice(variation.precio)}</p>
        </div>
      )}

      {/* Selección de variación */}
      <div className="space-y-4">
        {/* Tamaños */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tamaño</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                    }}
                    className={`px-4 py-2 border rounded-lg transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colores */}
        {colors.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                    }}
                    className={`px-4 py-2 border rounded-lg transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stock */}
      {variation && (
        <div>
          <p className="text-sm text-muted-foreground">
            Stock disponible: <span className="font-medium">{maxStock}</span>
          </p>
        </div>
      )}

      {/* Cantidad */}
      {variation && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Cantidad</label>
          <div className="flex items-center border border-border rounded-lg w-fit">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-4 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-6 py-2 border-x border-border min-w-16 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
              disabled={quantity >= maxStock}
              className="px-4 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
          ¡Producto agregado al carrito!
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!variation || !hasEnoughStock || loading || isCheckoutDisabled}
          className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? "Agregando..." : "Agregar al carrito"}
        </button>

        {success && (
          <button
            onClick={handleGoToCart}
            className="border border-border px-6 py-3 rounded-lg hover:bg-muted transition font-medium"
          >
            Ver carrito
          </button>
        )}
      </div>
    </div>
  );
}
