"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProductoCompleto } from "@/lib/types";

import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/app/api/cart/actions";
import { ShoppingCart } from "lucide-react";
import {
  IS_MAINTENANCE_MODE,
  IS_CHECKOUT_ENABLED,
} from "@/lib/config/features";
import { CARRITO_CONTENT } from "@/lib/content/carrito";
import { BUTTONS, CART, CART_LAYOUT } from "@/lib/design/tokens";

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

  // Obtener variaciones únicas por tamaño y color (memoizados)
  const variations = useMemo(
    () => producto.variaciones || [],
    [producto.variaciones],
  );
  const sizes = useMemo(
    () => [...new Set(variations.map((v) => v.tamanio))],
    [variations],
  );
  const colors = useMemo(
    () => [...new Set(variations.map((v) => v.color))],
    [variations],
  );

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
      setError(CARRITO_CONTENT.error.checkoutDisabled);
      return;
    }

    if (!variation) {
      setError(CARRITO_CONTENT.error.selectVariation);
      return;
    }

    if (!hasEnoughStock) {
      setError(CARRITO_CONTENT.error.noStock);
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
    <div
      className={
        CART_LAYOUT.container +
        " bg-muted/30 border border-border rounded-lg p-6"
      }
    >
      {/* Precio */}
      {variation && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {CARRITO_CONTENT.labels.total}
          </p>
          <p className="text-3xl font-bold">{formatPrice(variation.precio)}</p>
        </div>
      )}

      {/* Selección de variación */}
      <div className="space-y-4">
        {/* Tamaños */}
        {sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {CARRITO_CONTENT.labels.size}
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={isSelected ? BUTTONS.primary : BUTTONS.secondary}
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
            <label className="text-sm font-medium">
              {CARRITO_CONTENT.labels.color}
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={isSelected ? BUTTONS.primary : BUTTONS.secondary}
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
            {CARRITO_CONTENT.labels.stock}:{" "}
            <span className="font-medium">{maxStock}</span>
          </p>
        </div>
      )}

      {/* Cantidad */}
      {variation && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {CARRITO_CONTENT.labels.quantity}
          </label>
          <div className={CART.itemQtyBox + " w-fit"}>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={CART.itemQtyBtn}
            >
              -
            </button>
            <span className={CART.itemQtyValue + " min-w-16"}>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
              disabled={quantity >= maxStock}
              className={CART.itemQtyBtn}
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
          {CARRITO_CONTENT.success.added}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={
            !variation || !hasEnoughStock || loading || isCheckoutDisabled
          }
          className={
            BUTTONS.primary + " flex-1 flex items-center justify-center gap-2"
          }
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? CARRITO_CONTENT.labels.adding : CARRITO_CONTENT.labels.add}
        </button>

        {success && (
          <button onClick={handleGoToCart} className={BUTTONS.secondary}>
            {CARRITO_CONTENT.labels.viewCart}
          </button>
        )}
      </div>
    </div>
  );
}
