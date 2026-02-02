---
title: "Interactions - Fira Estudio"
description: "WhatsApp integration, custom hooks, and user interaction patterns"
version: "2.0"
lastUpdated: "2026-02-02"
activationTriggers:
  # WhatsApp
  - "whatsapp"
  - "contact"
  - "consulta"
  - "mensaje"
  - "rate-limit"
  - "rate limiting"
  
  # Custom Hooks
  - "hooks"
  - "custom hooks"
  - "useScrollLock"
  - "useEscapeKey"
  - "modal"
  - "drawer"
---

# Interactions Skill

## 🎯 Quick Reference

This skill covers **WhatsApp integration** and **custom hooks** - essential for user interactions in Fira Estudio.

**Key Principles:**
- WhatsApp is the primary contact method (V1)
- Rate limiting prevents spam (5 clicks/min, client-side)
- Custom hooks provide focus management and scroll locking
- Analytics track all WhatsApp interactions

---

## 📚 Part 1: WhatsApp Integration

### Basic Usage

```typescript
import { WHATSAPP } from "@/lib/constants";

const url = WHATSAPP.getUrl(
  `Hola! Consulta sobre:\n` +
    `Producto: ${producto.nombre}\n` +
    `Tamaño: ${variacion.tamanio}\n` +
    `Color: ${variacion.color}\n` +
    `Precio: ${formatPrice(variacion.precio)}`,
);
```

---

### Configuration

**Environment Variable**:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5492999123456
```

**Constants**:

```typescript
export const WHATSAPP = {
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  getUrl: (message: string): string =>
    `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`,
};
```

---

### Analytics Tracking

```typescript
import { trackWhatsAppClick } from "@/lib/analytics/gtag";

// With product only
trackWhatsAppClick(producto);

// With product and variation
trackWhatsAppClick(producto, variacion);
```

**Tracked Data**:
- `producto_id`, `producto_nombre`
- `variacion_id`, `variacion_tamanio`, `variacion_color` (if provided)
- `event_category`: "engagement"

---

### Rate Limiting

**Objective**: Prevent spam without breaking UX.

**Pattern**: Client-side rate limiting with localStorage.

#### useRateLimit Hook

```typescript
"use client";
import { useRateLimit } from "@/hooks";

export function WhatsAppButton({ producto, variacion }) {
  const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
    maxActions: 5,
    windowMs: 60000, // 1 minute
    key: "whatsapp_clicks",
  });

  const handleClick = () => {
    if (!recordAction()) {
      alert(\`Por favor esperá \${Math.ceil(timeUntilReset / 1000)}s.\`);
      return;
    }
    trackWhatsAppClick(producto, variacion);
  };

  return (
    <button onClick={handleClick} disabled={isRateLimited}>
      Consultar por WhatsApp
    </button>
  );
}
```

#### Rate Limit Architecture

**Layers**:
1. **Storage**: `lib/storage/rate-limit.ts` - localStorage operations
2. **Hook**: `hooks/useRateLimit.ts` - React hook interface
3. **UI**: `components/productos/WhatsAppButton.tsx` - user-facing component

**Behavior**:
- 5 clicks in 60 seconds → button disabled + countdown
- Fail-open if localStorage fails (better UX)
- Per-action key (can have different limits for different actions)

---

### WhatsApp Message Templates

#### Product Inquiry (V1)

```typescript
function getProductInquiryMessage(
  producto: Producto,
  variacion?: Variacion
): string {
  let message = `Hola! Consulta sobre:\n\n`;
  message += `📦 Producto: ${producto.nombre}\n`;
  
  if (variacion) {
    message += `📏 Tamaño: ${variacion.tamanio}\n`;
    message += `🎨 Color: ${variacion.color}\n`;
    message += `💰 Precio: ${formatPrice(variacion.precio)}\n`;
    message += `📦 Stock: ${variacion.stock === 0 ? "Bajo pedido" : "En stock"}\n`;
  } else {
    message += `💰 Desde: ${formatPrice(producto.precio_desde)}\n`;
  }
  
  return message;
}
```

---

## 📚 Part 2: Custom Hooks

### useScrollLock Hook

Locks body scroll when active. Perfect for modals, drawers, and full-screen overlays.

#### Basic Usage

```typescript
import { useScrollLock } from "@/hooks";

function Modal({ isOpen, onClose, children }) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="bg-white p-6">{children}</div>
    </div>
  );
}
```

#### Features

- Automatically locks body scroll when `isLocked` is `true`
- Restores original overflow value on cleanup
- Handles edge cases (e.g., preserves `overflow: scroll`)
- Zero dependencies

---

### useEscapeKey Hook

Handles ESC key press. Perfect for closing modals, drawers, and dialogs.

#### Basic Usage

```typescript
import { useEscapeKey } from "@/hooks";

function Dialog({ isOpen, onClose, children }) {
  // Close dialog when ESC is pressed
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return <div className="dialog">{children}</div>;
}
```

#### Advanced Usage

```typescript
import { useEscapeKey } from "@/hooks";

function SearchOverlay({ isOpen, onClose }) {
  const handleEscape = () => {
    console.log("Search cancelled");
    onClose();
  };

  // Only active when overlay is open
  useEscapeKey(handleEscape, isOpen);

  return isOpen ? <div>Search...</div> : null;
}
```

#### Features

- Flexible callback function
- Optional `isActive` parameter (defaults to `true`)
- Cleans up event listener on unmount
- Only responds to Escape key

---

### Using Both Hooks Together

Perfect combination for modals, drawers, and overlays:

```typescript
import { useScrollLock, useEscapeKey } from "@/hooks";

function Drawer({ isOpen, onClose, children }) {
  // Lock scroll when drawer is open
  useScrollLock(isOpen);

  // Close on ESC key
  useEscapeKey(onClose, isOpen);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white z-50">
          {children}
        </div>
      )}
    </>
  );
}
```

---

## 🔗 Integration Examples

### WhatsApp Button with Rate Limiting

```typescript
'use client';
import { useRateLimit } from "@/hooks";
import { WHATSAPP } from "@/lib/constants";
import { trackWhatsAppClick } from "@/lib/analytics/gtag";

export function ProductActions({ producto, variacion }) {
  const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
    maxActions: 5,
    windowMs: 60000,
    key: "whatsapp_clicks",
  });

  const handleWhatsAppClick = () => {
    // Check rate limit
    if (!recordAction()) {
      const seconds = Math.ceil(timeUntilReset / 1000);
      alert(\`Por favor esperá \${seconds}s antes de hacer otra consulta.\`);
      return;
    }

    // Track analytics
    trackWhatsAppClick(producto, variacion);

    // Build message
    const message = getProductInquiryMessage(producto, variacion);
    const url = WHATSAPP.getUrl(message);

    // Open WhatsApp
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      disabled={isRateLimited || !variacion}
      className={COMPONENTS.button.whatsapp}
    >
      {isRateLimited 
        ? \`Esperá \${Math.ceil(timeUntilReset / 1000)}s\`
        : "Consultar por WhatsApp"
      }
    </button>
  );
}
```

---

### Modal with Scroll Lock and ESC Key

```typescript
'use client';
import { useScrollLock, useEscapeKey } from "@/hooks";
import { useState } from "react";

export function ImageLightbox({ images, currentIndex, onClose }) {
  const isOpen = currentIndex !== null;

  // Lock scroll when lightbox is open
  useScrollLock(isOpen);

  // Close on ESC key
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/90 z-50"
        onClick={onClose}
      />

      {/* Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <img 
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className="max-w-4xl max-h-screen"
        />
      </div>
    </>
  );
}
```

---

### Cart Drawer with All Hooks

```typescript
'use client';
import { useScrollLock, useEscapeKey } from "@/hooks";
import { useCarrito } from "@/lib/context/CarritoContext";

export function CartDrawer() {
  const { carritoWithDetails, isDrawerOpen, closeDrawer, itemCount } = useCarrito();

  // Lock scroll when drawer is open
  useScrollLock(isDrawerOpen);

  // Close on ESC key
  useEscapeKey(closeDrawer, isDrawerOpen);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={COMPONENTS.carrito.drawer.overlay}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className={COMPONENTS.carrito.drawer.base}>
        <div className={COMPONENTS.carrito.drawer.header}>
          <h2>Tu carrito ({itemCount})</h2>
          <button onClick={closeDrawer}>✕</button>
        </div>

        <div className={COMPONENTS.carrito.drawer.content}>
          {itemCount === 0 ? (
            <EmptyCart compact />
          ) : (
            carritoWithDetails?.items.map(item => (
              <CartItemCard key={item.id} item={item} compact />
            ))
          )}
        </div>

        <div className={COMPONENTS.carrito.drawer.footer}>
          <Button href="/carrito">
            Ver carrito completo
          </Button>
        </div>
      </div>
    </>
  );
}
```

---

### Mobile Navigation with Focus Management

```typescript
'use client';
import { useScrollLock, useEscapeKey } from "@/hooks";
import { useState } from "react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Lock scroll when nav is open
  useScrollLock(isOpen);

  // Close on ESC key
  useEscapeKey(() => setIsOpen(false), isOpen);

  return (
    <>
      {/* Menu button */}
      <button onClick={() => setIsOpen(true)}>
        Menu
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Nav */}
      {isOpen && (
        <nav className="fixed inset-y-0 left-0 w-64 bg-white z-50">
          <button onClick={() => setIsOpen(false)}>
            Cerrar
          </button>
          
          <ul>
            <li><a href="/productos">Productos</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </nav>
      )}
    </>
  );
}
```

---

## 💡 Real-World Examples

### Filter Panel with Hooks

```typescript
function FilterPanel({ isOpen, onClose, filters }) {
  useScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40">
      <button onClick={onClose}>Close</button>
      {/* Filter options */}
    </aside>
  );
}
```

---

### Confirmation Dialog

```typescript
function ConfirmDialog({ isOpen, onConfirm, onCancel, message }) {
  useScrollLock(isOpen);
  useEscapeKey(onCancel, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-xl">
        <p>{message}</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 Related Documentation

- WhatsApp constants: `lib/constants/index.ts`
- Analytics tracking: `lib/analytics/gtag.ts`
- Rate limit storage: `lib/storage/rate-limit.ts`
- Custom hooks: `hooks/index.ts`
- Hook tests: `hooks/*.test.ts`

---

## ✅ Best Practices Checklist

**WhatsApp:**
- [ ] Usar `WHATSAPP.getUrl()` para links
- [ ] Trackear con `trackWhatsAppClick()`
- [ ] Activar rate limiting con `useRateLimit`
- [ ] No hardcodear número
- [ ] Mensajes < 250 caracteres
- [ ] Incluir detalles de variación en mensaje
- [ ] Handle localStorage errors (Safari private mode)

**Custom Hooks:**
- [ ] Always provide `isActive` parameter
- [ ] Clean callbacks - keep escape callbacks simple
- [ ] Combine hooks for better UX (scroll lock + ESC key)
- [ ] Test edge cases with nested components
- [ ] Use both hooks for all overlays (modals, drawers, dialogs)
- [ ] Ensure hooks clean up on unmount

**Testing:**
- [ ] `useScrollLock` - 5 tests (lock/unlock, cleanup, state changes)
- [ ] `useEscapeKey` - 7 tests (callbacks, activation, cleanup, key filtering)
- [ ] Rate limiting - Test localStorage errors
- [ ] WhatsApp - Test message formatting
