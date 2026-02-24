---
applyTo: "lib/analytics/**"
---

# Analytics — GA4 con gtag

## Setup

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

GA4 **solo corre en producción**. Verificar con `canTrack()` antes de llamar `window.gtag`.

## Eventos del proyecto

| Función | Cuándo disparar |
|---|---|
| `trackProductView(producto)` | Al montar página de detalle |
| `trackVariationSelect(producto, variacion)` | Al seleccionar tamaño/color |
| `trackWhatsAppClick(producto, variacion?)` | Al click en botón WhatsApp |
| `trackCategoryFilter(slug)` | Al filtrar por categoría |
| `trackAddToCart(producto, variacion, cantidad, precio)` | Al agregar al carrito |
| `trackViewCart(itemCount, subtotal)` | Al abrir drawer o página `/carrito` |
| `trackRemoveFromCart(producto, variacion, cantidad, value)` | Al eliminar item |

## Patrón de implementación

```ts
export function trackAddToCart(
  producto: Producto,
  variacion: Variacion,
  cantidad: number,
  precio_unitario: number,
): void {
  if (!canTrack()) return;
  window.gtag!("event", "add_to_cart", {
    event_category: "ecommerce",
    producto_id: producto.id,
    producto_nombre: producto.nombre,
    variacion_id: variacion.id,
    variacion_tamanio: variacion.tamanio,
    variacion_color: variacion.color,
    cantidad,
    precio_unitario,
    value: precio_unitario * cantidad,
  });
}
```

## Debug

- DevTools → Network → filtrar `google-analytics`
- Extensión **Google Analytics Debugger** → GA4 DebugView
- Los eventos tardan 24-48h en aparecer en reportes estándar