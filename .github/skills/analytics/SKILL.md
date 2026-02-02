---
title: "Analytics - Fira Estudio"
description: "GA4 setup, event tracking, and debugging patterns"
version: "2.1"
lastUpdated: "2026-02-02"
activationTriggers:
  # Spanish
  - "analytics"
  - "analítica"
  - "evento"
  - "rastreo"
  - "seguimiento"
  
  # English
  - "tracking"
  - "event"
  - "metrics"
  
  # Technical
  - "ga4"
  - "gtag"
  - "google analytics"
  - "carrito"
  - "cart"
---

# Analytics Skill

## 🎯 Quick Reference

- GA4 solo corre en producción.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` es obligatorio.
- Los eventos clave están definidos en `lib/analytics/gtag.ts`.
- Carrito V2 Phase 1 incluye 3 eventos de ecommerce.

---

## ✅ Setup rápido

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📊 Eventos trackeados

### Productos (V1)

1. **whatsapp_click** - Usuario hace clic en botón WhatsApp
2. **view_item** - Usuario visualiza producto
3. **filter_products** - Usuario filtra por categoría
4. **select_item** - Usuario selecciona variación

### Carrito V2 Phase 1

5. **add_to_cart** - Usuario agrega item al carrito
6. **view_cart** - Usuario abre carrito (drawer o página)
7. **remove_from_cart** - Usuario elimina item del carrito

---

## 🧩 Arquitectura

```
app/layout.tsx
  └─ <GoogleAnalytics /> (@next/third-parties/google)

lib/analytics/gtag.ts
  ├─ trackWhatsAppClick()
  ├─ trackProductView()
  ├─ trackCategoryFilter()
  ├─ trackVariationSelect()
  ├─ trackAddToCart()          ← Carrito V2
  ├─ trackViewCart()           ← Carrito V2
  └─ trackRemoveFromCart()     ← Carrito V2
```

---

## 🧪 Debugging

- DevTools → Network → filtrar "google-analytics"
- GA4 DebugView (con extensión Google Analytics Debugger)
- En dev: GA4 no se carga (verificar con console.log)

---

## 🚨 Problemas comunes

- ID mal configurado
- No estás en producción
- Adblockers bloqueando requests
- DevTools Network → Check para gtag requests

---

## 🔐 Privacidad / GDPR (si aplica)

- Agregar consentimiento antes de cargar GA
- GA4 anonimiza IP por defecto
- Retención recomendada: 14 meses

---

## ✅ Checklist

- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` configurado
- [ ] Eventos visibles en DebugView
- [ ] Tracking activo solo en prod
- [ ] Carrito events implementados (si aplica)

---

## 📚 Referencias

- `lib/analytics/gtag.ts`
- `app/layout.tsx`

---

## 🛒 Carrito V2 - Fase 1 (Eventos)

**Objetivo:** medir intención de compra sin checkout.

### Eventos requeridos

#### 1. add_to_cart

Se dispara cuando el usuario agrega un ítem al carrito.

**Parámetros:**

- `event_category`: "ecommerce"
- `producto_id`: UUID del producto
- `producto_nombre`: Nombre del producto
- `variacion_id`: UUID de la variación
- `variacion_tamanio`: Size seleccionado
- `variacion_color`: Color seleccionado
- `cantidad`: Items agregados
- `precio_unitario`: Precio snapshot al momento de agregar
- `value`: precio_unitario \* cantidad

#### 2. view_cart

Se dispara al abrir la página de carrito o el drawer.

**Parámetros:**

- `event_category`: "ecommerce"
- `item_count`: Cantidad total de items
- `subtotal`: Valor total del carrito
- `value`: subtotal

#### 3. remove_from_cart

Se dispara cuando se elimina un ítem del carrito.

**Parámetros:**

- `event_category`: "ecommerce"
- `producto_id`: UUID del producto removido
- `variacion_id`: UUID de la variación removida
- `cantidad`: Items removidos
- `value`: Valor total del item removido

---

## 🛠️ Tracking Helpers Implementation

Agrega estas funciones a `lib/analytics/gtag.ts`:

```typescript
/**
 * Track add to cart event
 * @param producto - Product being added
 * @param variacion - Selected variation
 * @param cantidad - Quantity added
 * @param precio_unitario - Price snapshot at time of add
 */
export function trackAddToCart(
  producto: Producto,
  variacion: Variacion,
  cantidad: number,
  precio_unitario: number,
): void {
  if (!canTrack()) return;

  const value = precio_unitario * cantidad;

  window.gtag!("event", "add_to_cart", {
    event_category: "ecommerce",
    producto_id: producto.id,
    producto_nombre: producto.nombre,
    variacion_id: variacion.id,
    variacion_tamanio: variacion.tamanio,
    variacion_color: variacion.color,
    cantidad,
    precio_unitario,
    value,
  });
}

/**
 * Track view cart event
 * @param item_count - Number of items in cart
 * @param subtotal - Total cart value
 */
export function trackViewCart(item_count: number, subtotal: number): void {
  if (!canTrack()) return;

  window.gtag!("event", "view_cart", {
    event_category: "ecommerce",
    item_count,
    subtotal,
    value: subtotal,
  });
}

/**
 * Track remove from cart event
 * @param producto - Product being removed
 * @param variacion - Removed variation
 * @param cantidad - Quantity removed
 * @param value - Total value of removed item
 */
export function trackRemoveFromCart(
  producto: Producto,
  variacion: Variacion,
  cantidad: number,
  value: number,
): void {
  if (!canTrack()) return;

  window.gtag!("event", "remove_from_cart", {
    event_category: "ecommerce",
    producto_id: producto.id,
    variacion_id: variacion.id,
    cantidad,
    value,
  });
}
```

---

## 📍 Puntos de integración

### 1. AddToCartButton

```typescript
import { trackAddToCart } from "@/lib/analytics/gtag";
import { useCarrito } from "@/lib/context/CarritoContext";

export function AddToCartButton({ producto, variacion, cantidad }) {
  const { addItem } = useCarrito();

  const handleAddToCart = () => {
    // Agregar al carrito
    addItem(producto, variacion, cantidad);

    // Trackear evento
    trackAddToCart(producto, variacion, cantidad, variacion.precio);

    // Toast confirmación
    showToast(`${producto.nombre} agregado`);
  };

  return (
    <button onClick={handleAddToCart}>
      Agregar al carrito
    </button>
  );
}
```

### 2. CartDrawer

```typescript
import { trackViewCart } from "@/lib/analytics/gtag";
import { useCarrito } from "@/lib/context/CarritoContext";
import { useEffect } from "react";

export function CartDrawer({ isOpen }) {
  const { carrito, itemCount } = useCarrito();

  useEffect(() => {
    if (isOpen && itemCount > 0) {
      trackViewCart(itemCount, carrito.subtotal);
    }
  }, [isOpen, itemCount, carrito.subtotal]);

  return (
    <div className="cart-drawer">
      {/* Drawer content */}
    </div>
  );
}
```

### 3. CartItemCard (remover)

```typescript
import { trackRemoveFromCart } from "@/lib/analytics/gtag";
import { useCarrito } from "@/lib/context/CarritoContext";

export function CartItemCard({ item, producto, variacion }) {
  const { removeItem } = useCarrito();

  const handleRemove = () => {
    const itemValue = item.precio_unitario * item.cantidad;

    removeItem(item.id);
    trackRemoveFromCart(
      producto,
      variacion,
      item.cantidad,
      itemValue,
    );
  };

  return (
    <div className="cart-item">
      {/* Item content */}
      <button onClick={handleRemove}>Remover</button>
    </div>
  );
}
```

---

## ✅ Testing Checklist

- [ ] add_to_cart se dispara al agregar producto
- [ ] view_cart se dispara al abrir drawer
- [ ] remove_from_cart se dispara al remover item
- [ ] Eventos visibles en GA4 DebugView
- [ ] item_count y subtotal correctos
- [ ] price snapshots guardados
- [ ] Solo en producción (no en dev)
- [ ] Test en DebugView → 24-48h para standard reports

---

## 📚 Referencias Finales

- [.github/skills/carrito/SKILL.md](.github/skills/carrito/SKILL.md)
- [.github/reference/business-logic.md](.github/reference/business-logic.md)
- `lib/analytics/gtag.ts`
- `lib/context/CarritoContext.tsx`
- [Google Analytics 4 Documentation](https://support.google.com/analytics)
