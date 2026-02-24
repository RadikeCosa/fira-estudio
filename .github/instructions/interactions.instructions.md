---
applyTo: "components/productos/ProductActions*,components/productos/WhatsAppButton*,hooks/**"
---

# Interacciones — WhatsApp y Custom Hooks

## WhatsApp

Nunca hardcodear el número. Usar siempre la constante:

```ts
import { WHATSAPP } from "@/lib/constants";

const url = WHATSAPP.getUrl(
  `Hola! Consulta sobre:\n\n` +
  `📦 Producto: ${producto.nombre}\n` +
  `📏 Tamaño: ${variacion.tamanio}\n` +
  `🎨 Color: ${variacion.color}\n` +
  `💰 Precio: ${formatPrice(variacion.precio)}\n` +
  `📦 Stock: ${variacion.stock === 0 ? "Bajo pedido" : "En stock"}`
);
window.open(url, "_blank");
```

**Rate limiting** — usar `useRateLimit` para evitar spam:

```ts
const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
  maxActions: 5,
  windowMs: 60_000,
  key: "whatsapp_clicks",
});

// Antes de abrir WhatsApp
if (!recordAction()) {
  alert(`Por favor esperá ${Math.ceil(timeUntilReset / 1000)}s`);
  return;
}
trackWhatsAppClick(producto, variacion);
```

## Custom Hooks

### `useScrollLock(isLocked: boolean)`

Bloquea el scroll del body. Restaura el valor original al desmontar.

```ts
useScrollLock(isDrawerOpen); // En CartDrawer, MobileNav, Lightbox
```

### `useEscapeKey(callback: () => void, isActive?: boolean)`

Cierra overlays al presionar Escape. Limpia el listener al desmontar.

```ts
useEscapeKey(closeDrawer, isDrawerOpen);
```

### Patrón combinado (todos los overlays)

```ts
// Siempre usar ambos hooks juntos en modales, drawers y navs móviles
useScrollLock(isOpen);
useEscapeKey(onClose, isOpen);
```