"use server";

import { cookies } from "next/headers";
import { IS_PUBLIC_CHECKOUT_AVAILABLE } from "@/lib/config/features";
import { CARRITO_CONTENT } from "@/lib/content/carrito";
import { CartRepository } from "@/lib/repositories/cart.repository";
import type { Cart, CartItem } from "@/lib/types";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 días
const CHECKOUT_DISABLED_MESSAGE = CARRITO_CONTENT.error.checkoutDisabled;

function assertPublicCheckoutAvailable(): void {
  if (!IS_PUBLIC_CHECKOUT_AVAILABLE) {
    throw new Error(CHECKOUT_DISABLED_MESSAGE);
  }
}

function buildInactiveCart(): Cart & { items: CartItem[] } {
  const now = new Date().toISOString();

  return {
    id: "checkout-disabled",
    user_id: null,
    total_amount: 0,
    created_at: now,
    updated_at: now,
    expires_at: now,
    items: [],
  };
}

/**
 * Obtiene o crea un session_id para el usuario anónimo
 *
 * El session_id se almacena en una cookie para persistir entre sesiones
 * Permite mantener el carrito durante 7 días sin iniciar sesión
 *
 * IMPORTANTE: cookies() retorna una Promise en Next.js 16+
 */
async function getSessionId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      // Generar nuevo session_id (UUID v4)
      sessionId = crypto.randomUUID();

      // Guardar en cookie
      cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        maxAge: SESSION_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      console.log(`[Cart] Nuevo session_id generado: ${sessionId}`);
    }

    return sessionId;
  } catch (error) {
    console.error("[Cart] Error getting session_id:", error);
    // Fallback: generar UUID si hay error
    return crypto.randomUUID();
  }
}

export async function createOrGetCart(): Promise<Cart> {
  assertPublicCheckoutAvailable();

  const session_id = await getSessionId();
  const repo = new CartRepository();
  return await repo.getOrCreateCart(session_id);
}

export async function getCart(): Promise<Cart & { items: CartItem[] }> {
  if (!IS_PUBLIC_CHECKOUT_AVAILABLE) {
    return buildInactiveCart();
  }

  const session_id = await getSessionId();
  const repo = new CartRepository();
  return await repo.getCartWithItems(session_id);
}

export async function addToCart(
  variacion_id: string,
  quantity: number,
  price: number,
): Promise<CartItem> {
  assertPublicCheckoutAvailable();

  const session_id = await getSessionId();
  const repo = new CartRepository();
  const cart = await repo.getOrCreateCart(session_id);
  const item = await repo.addItem(cart.id, variacion_id, quantity, price);
  await repo.updateCartTotal(cart.id);
  return item;
}

export async function removeFromCart(item_id: string): Promise<void> {
  assertPublicCheckoutAvailable();

  const repo = new CartRepository();
  await repo.removeItem(item_id);
  // Opcional: recalcular total si lo necesitas
}

export async function updateCartQuantity(
  item_id: string,
  quantity: number,
): Promise<CartItem> {
  assertPublicCheckoutAvailable();

  const repo = new CartRepository();
  const item = await repo.updateItemQuantity(item_id, quantity);
  // Opcional: recalcular total si lo necesitas
  return item;
}

export async function clearCart(): Promise<void> {
  assertPublicCheckoutAvailable();

  const session_id = await getSessionId();
  const repo = new CartRepository();
  const cart = await repo.getOrCreateCart(session_id);
  await repo.clearCart(cart.id);
  await repo.updateCartTotal(cart.id);
}
