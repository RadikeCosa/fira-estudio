# Artículo 2 — Carrito con Server Actions + Supabase

## Objetivo
Explicar cómo funciona el carrito para usuarios anónimos usando Server Actions, cookies y persistencia en Supabase.

## Archivos foco
- `app/api/cart/actions.ts`
- `lib/repositories/cart.repository.ts`
- `lib/types.ts`
- `components/carrito/ShoppingCart.tsx`

## Estructura del artículo

### 1) Problema
- ¿Cómo mantener un carrito consistente sin login?
- ¿Por qué no alcanza con estado local?

### 2) Flujo
- Resolver `session_id`
- Obtener/crear carrito
- Agregar item, actualizar cantidad, limpiar
- Renderizar estado en UI

### 3) Archivo por archivo
#### `app/api/cart/actions.ts`
- Qué exporta
- Cómo resuelve sesión
- Validaciones clave
- Posible desvío detectado: fallback de `session_id`

#### `lib/repositories/cart.repository.ts`
- Métodos del repositorio
- Persistencia en `carts` y `cart_items`
- Por qué existe `price_at_addition`

#### `lib/types.ts`
- Tipos de carrito y contrato entre capas

#### `components/carrito/ShoppingCart.tsx`
- Estados visuales y sincronización con backend

### 4) Decisiones de diseño
- Server Actions vs API REST
- Repositorio vs acceso directo a DB
- Snapshot de precio vs precio live

### 5) Alternativas (pros/contras)
- Context + localStorage-only
- BFF con endpoints REST puros
- Session ligada a JWT anónimo

### 6) Errores comunes
- Confiar en cálculo de subtotal del cliente
- No manejar race conditions de clicks rápidos
- No tipar retornos de acciones

### 7) Checklist
- [ ] Cookies de sesión consistentes
- [ ] Repositorio tipado
- [ ] Estados de loading/error en UI
- [ ] Reglas de negocio en servidor
