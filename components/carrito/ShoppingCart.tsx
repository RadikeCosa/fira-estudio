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
    if (!confirm("¿Estás seguro de vaciar el carrito?")) return;

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-medium">Error al cargar el carrito</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadCart}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
        <Link
          href="/productos"
          className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Items del carrito */}
      <div className="space-y-4">
        {cart.items.map((item) => {
          const producto = item.variacion?.producto;
          const imagenPrincipal =
            producto?.imagenes?.find((img) => img.es_principal)?.url ||
            producto?.imagenes?.[0]?.url;
          const isUpdating = updating === item.id;

          return (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white border border-border rounded-lg"
            >
              {/* Imagen */}
              {imagenPrincipal && (
                <div className="relative w-24 h-24 shrink-0">
                  <Image
                    src={getImageUrl(imagenPrincipal)}
                    alt={producto?.nombre || "Producto"}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Info del producto */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate">
                  {producto?.nombre || "Producto"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.variacion?.tamanio} • {item.variacion?.color}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(item.price_at_addition)} c/u
                </p>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={isUpdating || item.quantity <= 1}
                      className="px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x border-border min-w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={isUpdating}
                      className="px-3 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isUpdating}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatPrice(item.quantity * item.price_at_addition)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="border-t border-border pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-bold">
            {formatPrice(cart.total_amount)}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClearCart}
            className="flex-1 border border-border px-4 py-3 rounded-lg hover:bg-muted transition"
          >
            Vaciar carrito
          </button>
          <Link
            href="/checkout"
            className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition text-center font-medium"
          >
            Continuar con la compra
          </Link>
        </div>
      </div>
    </div>
  );
}
