---
applyTo: "components/carrito/**,lib/context/CarritoContext*,lib/storage/carrito*"
---

# Carrito — Patrones y reglas

## Arquitectura

```
CarritoProvider (app/layout.tsx)
  └── CarritoContext  →  useCarrito()
        ├── localStorage (fira_carrito, TTL 14 días)
        └── Supabase (detalles de productos en runtime)
```

## Tipos clave

```ts
interface CarritoItem {
  id: string;              // crypto.randomUUID() en cliente
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number; // Snapshot al momento de agregar — no cambia
  agregado_at: string;
}

interface Carrito {
  items: CarritoItem[];
  subtotal: number;        // sum(precio_unitario * cantidad)
  created_at: string;
  updated_at: string;
}
```

## Reglas de negocio

**Al agregar:**
- Variación requerida; botón disabled sin selección
- Guardar `precio_unitario = variacion.precio` como snapshot
- Si mismo `producto_id + variacion_id` ya existe → mergear sumando cantidad

**En el carrito:**
- Detectar cambio de precio: `item.precio_unitario !== variacion.precio` → mostrar warning
- `stock = 0` en variación → permitir checkout ("A pedido")
- `producto.activo = false` o `variacion.activo = false` → warning, bloquear checkout

**localStorage:**
```ts
try {
  localStorage.setItem("fira_carrito", JSON.stringify(carrito));
} catch {
  // QuotaExceededError o Safari private mode → fallback a memoria
  // Mostrar banner: "Tu carrito no se guardará al cerrar la pestaña"
}
```

## UX del drawer

- Drawer: vista compacta, sin editar cantidad
- Página `/carrito`: vista completa con `QuantitySelector`
- Usar `useScrollLock(isDrawerOpen)` y `useEscapeKey(closeDrawer, isDrawerOpen)`
- `CartBadge` en header muestra `itemCount`; click abre drawer

## Analytics (siempre trackear)

```ts
trackAddToCart(producto, variacion, cantidad, variacion.precio);  // Al agregar
trackViewCart(itemCount, subtotal);                                // Al abrir drawer/página
trackRemoveFromCart(producto, variacion, cantidad, value);         // Al eliminar
```