---
applyTo: "app/api/cart/**,app/carrito/**,components/carrito/**"
---

# Instrucciones de carrito (arquitectura vigente)

## Arquitectura real
El carrito es **server-side** y persiste en Supabase.

### Flujo principal
- `app/api/cart/actions.ts` (Server Actions, todas con `"use server"`).
- `getSessionId()`
  - Lee/crea cookie `session_id`.
  - Cookie `httpOnly`, `maxAge: 7 días`.
- `CartRepository`
  - Opera sobre tablas `cart` y `cart_items` en Supabase.

## Server Actions disponibles
- `createOrGetCart`
- `getCart`
- `addToCart`
- `removeFromCart`
- `updateCartQuantity`
- `clearCart`

Todas deben mantenerse como Server Actions (`"use server"`).

## Tipos y reglas de datos
- `CartItem` incluye `price_at_addition`.
  - Es snapshot al momento de agregar.
  - No debe cambiar aunque cambie el precio del producto.
- `Cart` incluye:
  - `id`
  - `session_id`
  - `total_amount`

## Bug conocido (no replicar)
En `getSessionId()`, si falla `cookies()`, el `catch` genera un UUID pero no lo persiste en cookie.  
Eso puede crear carritos huérfanos en DB.

**Regla:** no agregar código nuevo que repita ese patrón (generar `session_id` sin persistencia real en cookie).

## Reglas UX obligatorias
- Si `stock = 0`, permitir agregar mostrando estado **"A pedido"**.
- Si el producto requiere variación, no habilitar botón de agregar hasta seleccionarla.

## Restricciones
- No usar `localStorage` para estado fuente de carrito.
- No usar `CarritoContext` / `CarritoProvider`.
- No agregar lógica de carrito cliente que desincronice Supabase.