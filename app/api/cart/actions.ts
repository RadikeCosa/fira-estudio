"use server";

import { cookies } from "next/headers";
import { CartRepository } from "@/lib/repositories/cart.repository";
import type { Cart, CartItem } from "@/lib/types";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 días

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
  const session_id = await getSessionId();
  return await CartRepository.getOrCreateCart(session_id);
}

export async function getCart(): Promise<Cart & { items: CartItem[] }> {
  const session_id = await getSessionId();
  return await CartRepository.getCartWithItems(session_id);
}

export async function addToCart(
  variacion_id: string,
  quantity: number,
  price: number,
): Promise<CartItem> {
  const session_id = await getSessionId();
  const cart = await CartRepository.getOrCreateCart(session_id);
  const item = await CartRepository.addItem(
    cart.id,
    variacion_id,
    quantity,
    price,
  );
  await CartRepository.updateCartTotal(cart.id);
  return item;
}

export async function removeFromCart(item_id: string): Promise<void> {
  await CartRepository.removeItem(item_id);
  // Opcional: recalcular total si lo necesitas
}

export async function updateCartQuantity(
  item_id: string,
  quantity: number,
): Promise<CartItem> {
  const item = await CartRepository.updateItemQuantity(item_id, quantity);
  // Opcional: recalcular total si lo necesitas
  return item;
}

export async function clearCart(): Promise<void> {
  const session_id = await getSessionId();
  const cart = await CartRepository.getOrCreateCart(session_id);
  await CartRepository.clearCart(cart.id);
  await CartRepository.updateCartTotal(cart.id);
}
