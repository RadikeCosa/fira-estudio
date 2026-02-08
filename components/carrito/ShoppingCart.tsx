"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice, getImageUrl } from "@/lib/utils";
import type { Cart, CartItem } from "@/lib/types";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "@/app/api/cart/actions";
import { BUTTONS, CART, CART_LAYOUT } from "@/lib/design/tokens";
import { combine } from "@/lib/design/tokens";
import { CARRITO_CONTENT } from "@/lib/content/carrito";

export function ShoppingCart() {
  const [cart, setCart] = useState<(Cart & { items: CartItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(itemId);
      await updateCartQuantity(itemId, newQuantity);
      await loadCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      await removeFromCart(itemId);
      await loadCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm(CARRITO_CONTENT.error.confirmClear)) return;

    try {
      setLoading(true);
      await clearCart();
      await loadCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={combine("flex items-center justify-center py-12")}>
        {" "}
        {/* Spinner layout */}
        <div
          className={combine(
            "animate-spin rounded-full h-8 w-8 border-b-2 border-primary",
          )}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={combine(
          "bg-red-50 border border-red-200 rounded-lg p-4 text-red-800",
        )}
      >
        {/* Error container, custom style */}
        <p className="font-medium">{CARRITO_CONTENT.error.load}</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadCart}
          className={combine("mt-2", BUTTONS.underline)}
        >
          {CARRITO_CONTENT.actions.retry}
        </button>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={CART.empty}>{CARRITO_CONTENT.empty.message}</p>
        <Link
          href="/productos"
          className={combine(BUTTONS.inline, BUTTONS.primary)}
        >
          {CARRITO_CONTENT.empty.cta}
        </Link>
      </div>
    );
  }

  return (
    <div className={CART_LAYOUT.container}>
      {/* Items del carrito */}
      <div className={CART_LAYOUT.items}>
        {cart.items.map((item) => {
          const producto = item.variacion?.producto;
          const imagenPrincipal =
            producto?.imagenes?.find((img) => img.es_principal)?.url ||
            producto?.imagenes?.[0]?.url;
          const isUpdating = updating === item.id;

          return (
            <div key={item.id} className={CART_LAYOUT.item}>
              {/* Imagen */}
              {imagenPrincipal && (
                <div className={CART_LAYOUT.imageBox}>
                  <Image
                    src={getImageUrl(imagenPrincipal)}
                    alt={producto?.nombre || "Producto"}
                    fill
                    className={CART_LAYOUT.image}
                  />
                </div>
              )}

              {/* Info del producto */}
              <div className={CART_LAYOUT.itemInfo}>
                <h3 className={CART.itemTitle}>
                  {producto?.nombre || "Producto"}
                </h3>
                <p className={CART.itemDetail}>
                  {item.variacion?.tamanio} • {item.variacion?.color}
                </p>
                <p className={CART.itemPrice}>
                  {formatPrice(item.price_at_addition)} c/u
                </p>

                {/* Controles de cantidad */}
                <div className={CART.itemControls}>
                  <div className={CART.itemQtyBox}>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={isUpdating || item.quantity <= 1}
                      className={CART.itemQtyBtn}
                    >
                      -
                    </button>
                    <span className={CART.itemQtyValue}>{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={isUpdating}
                      className={CART.itemQtyBtn}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isUpdating}
                    className={BUTTONS.danger}
                  >
                    {CARRITO_CONTENT.actions.remove}
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className={CART_LAYOUT.itemSubtotal}>
                <p className={CART.subtotal}>
                  {formatPrice(item.quantity * item.price_at_addition)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className={CART_LAYOUT.summary}>
        <div className={CART_LAYOUT.summaryRow}>
          <span className={CART.totalLabel}>
            {CARRITO_CONTENT.labels.total}
          </span>
          <span className={CART.totalValue}>
            {formatPrice(cart.total_amount)}
          </span>
        </div>

        <div className={CART_LAYOUT.summaryActions}>
          <button onClick={handleClearCart} className={BUTTONS.secondary}>
            {CARRITO_CONTENT.actions.clear}
          </button>
          <Link href="/checkout" className={BUTTONS.primary}>
            {CARRITO_CONTENT.actions.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}
