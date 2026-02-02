---
title: "E-commerce - Fira Estudio"
description: "Shopping cart, analytics tracking, and e-commerce patterns"
version: "2.0"
lastUpdated: "2026-02-02"
activationTriggers:
  # Shopping Cart
  - "carrito"
  - "cart"
  - "agregar"
  - "checkout"
  - "localStorage"
  - "item"
  - "comprar"
  
  # Analytics
  - "analytics"
  - "ga4"
  - "gtag"
  - "tracking"
  - "event"
  - "evento"
---

# E-commerce Skill

## 🎯 Quick Reference

This skill covers **shopping cart** and **analytics tracking** - essential for e-commerce conversion tracking.

**Key Principles:**
- Cart uses Context API + localStorage (14-day TTL, anonymous)
- Analytics tracks key e-commerce events (add_to_cart, view_cart, remove_from_cart)
- Drawer for quick add, full page for checkout flow
- Price snapshot at time of add to detect price changes

---

## 📚 Part 1: Shopping Cart

### Business Rules

#### Key Concepts

1. **Carrito anónimo** (no requiere autenticación)
   - Persiste en localStorage (14 días TTL)
   - Se pierde al limpiar datos del browser

2. **Precio snapshot** al agregar
   - `precio_unitario` guarda precio al momento de agregar
   - Detecta cambios de precio y muestra warning

3. **Stock = 0 sigue siendo válido**
   - "Bajo pedido" sigue aplicando
   - Validación real de stock en checkout (Fase 2)

4. **Variación requerida**
   - No se puede agregar producto sin seleccionar variación
   - Botón "Agregar al carrito" disabled hasta seleccionar

---

### Data Structure

#### CarritoItem

\`\`\`typescript
interface CarritoItem {
  id: string; // UUID cliente (crypto.randomUUID())
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number; // Snapshot al agregar
  agregado_at: string; // ISO timestamp
}
\`\`\`

#### Carrito

\`\`\`typescript
interface Carrito {
  items: CarritoItem[];
  subtotal: number; // Calculado: sum(item.precio_unitario * item.cantidad)
  created_at: string;
  updated_at: string;
}
\`\`\`

#### CarritoWithDetails

\`\`\`typescript
interface CarritoWithDetails extends Carrito {
  items: (CarritoItem & {
    producto: ProductoCompleto;
    variacion: Variacion;
  })[];
}
\`\`\`

---

### LocalStorage Manager

**Location**: \`lib/storage/carrito.ts\`

#### Key Functions

\`\`\`typescript
const CARRITO_KEY = "fira_carrito";
const CARRITO_TTL = 14 * 24 * 60 * 60 * 1000; // 14 días

// CRUD Operations
export function getCarrito(): Carrito;
export function setCarrito(carrito: Carrito): void;
export function addItem(item: CarritoItem): void;
export function updateItemQuantity(itemId: string, cantidad: number): void;
export function removeItem(itemId: string): void;
export function clearCarrito(): void;

// Helpers
export function calculateSubtotal(items: CarritoItem[]): number;
export function isExpired(carrito: Carrito): boolean;
export function mergeItems(
  existing: CarritoItem,
  nuevo: CarritoItem,
): CarritoItem;
\`\`\`

#### Error Handling

\`\`\`typescript
try {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
} catch (error) {
  // QuotaExceededError, Safari private mode
  console.error("localStorage error:", error);
  // Fallback: usar estado en memoria (se pierde al recargar)
  return getInMemoryCarrito();
}
\`\`\`

---

### Context API

**Location**: \`lib/context/CarritoContext.tsx\`

#### Interface

\`\`\`typescript
interface CarritoContextValue {
  carrito: Carrito;
  carritoWithDetails: CarritoWithDetails | null;
  itemCount: number;
  isLoading: boolean;

  addItem: (
    producto: ProductoCompleto,
    variacion: Variacion,
    cantidad: number,
  ) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  removeItem: (itemId: string) => void;
  clearCarrito: () => void;

  // Drawer control
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}
\`\`\`

#### Provider Setup

\`\`\`typescript
// app/layout.tsx
import { CarritoProvider } from '@/lib/context/CarritoContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CarritoProvider>
          <Header />
          {children}
          <Footer />
        </CarritoProvider>
      </body>
    </html>
  );
}
\`\`\`

#### Usage in Components

\`\`\`typescript
"use client";
import { useCarrito } from "@/lib/context/CarritoContext";

export function AddToCartButton() {
  const { addItem, openDrawer } = useCarrito();

  const handleAdd = () => {
    addItem(producto, variacion, 1);
    openDrawer(); // Abre drawer automáticamente
  };
}
\`\`\`

---

### Component Patterns

#### CartBadge (Header)

**Location**: \`components/carrito/CartBadge.tsx\`

\`\`\`typescript
'use client';
import { useCarrito } from '@/lib/context/CarritoContext';

export function CartBadge() {
  const { itemCount, openDrawer } = useCarrito();

  return (
    <button onClick={openDrawer} className="relative">
      🛒
      {itemCount > 0 && (
        <span className={COMPONENTS.carrito.badge}>
          {itemCount}
        </span>
      )}
    </button>
  );
}
\`\`\`

---

#### AddToCartButton

**Location**: \`components/carrito/AddToCartButton.tsx\`

\`\`\`typescript
'use client';

interface AddToCartButtonProps {
  producto: ProductoCompleto;
  variacion: Variacion | null;
  cantidad?: number;
}

export function AddToCartButton({ producto, variacion, cantidad = 1 }) {
  const { addItem, openDrawer } = useCarrito();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    if (!variacion) return;

    setIsAdding(true);
    trackAddToCart(producto, variacion, cantidad);
    addItem(producto, variacion, cantidad);
    openDrawer();

    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!variacion || isAdding}
    >
      {isAdding ? '✓ Agregado' : 'Agregar al carrito'}
    </Button>
  );
}
\`\`\`

---

#### CartItemCard

**Location**: \`components/carrito/CartItemCard.tsx\`

\`\`\`typescript
interface CartItemCardProps {
  item: CarritoItem & {
    producto: ProductoCompleto;
    variacion: Variacion;
  };
  onUpdateQuantity: (itemId: string, cantidad: number) => void;
  onRemove: (itemId: string) => void;
  compact?: boolean; // true para drawer, false para página
}

export function CartItemCard({ item, onUpdateQuantity, onRemove, compact }) {
  const imagenPrincipal = item.producto.imagenes.find(i => i.es_principal);
  const priceChanged = item.precio_unitario !== item.variacion.precio;

  return (
    <div className={compact ? COMPONENTS.carrito.item.cardCompact : COMPONENTS.carrito.item.card}>
      <Image
        src={imagenPrincipal?.url}
        className={compact ? COMPONENTS.carrito.item.imageCompact : COMPONENTS.carrito.item.image}
      />

      <div className={COMPONENTS.carrito.item.content}>
        <h3>{item.producto.nombre}</h3>
        <p>{item.variacion.tamanio} • {item.variacion.color}</p>

        {priceChanged && (
          <p className="text-warning">
            Precio cambió: {formatPrice(item.variacion.precio)}
          </p>
        )}

        {!compact && (
          <QuantitySelector
            value={item.cantidad}
            onChange={(val) => onUpdateQuantity(item.id, val)}
          />
        )}

        <p>{formatPrice(item.precio_unitario * item.cantidad)}</p>
      </div>

      <button onClick={() => onRemove(item.id)}>
        🗑️
      </button>
    </div>
  );
}
\`\`\`

---

#### CartDrawer

**Location**: \`components/carrito/CartDrawer.tsx\`

\`\`\`typescript
'use client';

export function CartDrawer() {
  const { carritoWithDetails, isDrawerOpen, closeDrawer, itemCount } = useCarrito();

  useScrollLock(isDrawerOpen);
  useEscapeKey(closeDrawer, isDrawerOpen);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={COMPONENTS.carrito.drawer.overlay} onClick={closeDrawer} />

      {/* Drawer */}
      <div className={COMPONENTS.carrito.drawer.base}>
        <div className={COMPONENTS.carrito.drawer.header}>
          <h2>{CARRITO_CONTENT.drawer.title} ({itemCount})</h2>
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
          <div className="flex justify-between">
            <span>{CARRITO_CONTENT.drawer.subtotal}</span>
            <span>{formatPrice(carritoWithDetails?.subtotal)}</span>
          </div>
          <Button href="/carrito" size="lg">
            {CARRITO_CONTENT.drawer.checkout}
          </Button>
        </div>
      </div>
    </>
  );
}
\`\`\`

---

### Validation Rules

#### Al Agregar

\`\`\`typescript
function validateAddToCart(variacion: Variacion | null): string | null {
  if (!variacion) {
    return "Seleccioná una variación";
  }

  if (!variacion.activo) {
    return "Esta variación no está disponible";
  }

  return null; // Valid
}
\`\`\`

#### En Carrito

\`\`\`typescript
function validateCartItem(
  item: CarritoItem,
  producto: ProductoCompleto,
  variacion: Variacion,
): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!producto.activo) {
    warnings.push(CARRITO_CONTENT.page.validation.productInactive);
  }

  if (!variacion.activo) {
    warnings.push(CARRITO_CONTENT.page.validation.variationInactive);
  }

  if (item.precio_unitario !== variacion.precio) {
    warnings.push(CARRITO_CONTENT.page.validation.priceChanged);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
\`\`\`

---

### Merging Items

Si usuario agrega mismo producto+variación 2 veces:

\`\`\`typescript
function mergeItems(existing: CarritoItem, nuevo: CarritoItem): CarritoItem {
  // Sumar cantidades
  return {
    ...existing,
    cantidad: existing.cantidad + nuevo.cantidad,
    updated_at: new Date().toISOString(),
  };
}
\`\`\`

---

## 📚 Part 2: Analytics Tracking

### Setup

**Environment Variable**:

\`\`\`env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
\`\`\`

**Architecture**:

\`\`\`
app/layout.tsx
  └─ <GoogleAnalytics /> (@next/third-parties/google)

lib/analytics/gtag.ts
  ├─ trackWhatsAppClick()
  ├─ trackProductView()
  ├─ trackCategoryFilter()
  ├─ trackVariationSelect()
  ├─ trackAddToCart()          ← Cart Event
  ├─ trackViewCart()           ← Cart Event
  └─ trackRemoveFromCart()     ← Cart Event
\`\`\`

---

### Tracked Events

#### Products (V1)

1. **whatsapp_click** - Usuario hace clic en botón WhatsApp
2. **view_item** - Usuario visualiza producto
3. **filter_products** - Usuario filtra por categoría
4. **select_item** - Usuario selecciona variación

#### Cart (V2 Phase 1)

5. **add_to_cart** - Usuario agrega item al carrito
6. **view_cart** - Usuario abre carrito (drawer o página)
7. **remove_from_cart** - Usuario elimina item del carrito

---

### Cart Event Tracking

#### 1. add_to_cart

Se dispara cuando el usuario agrega un ítem al carrito.

**Parámetros:**

- \`event_category\`: "ecommerce"
- \`producto_id\`: UUID del producto
- \`producto_nombre\`: Nombre del producto
- \`variacion_id\`: UUID de la variación
- \`variacion_tamanio\`: Size seleccionado
- \`variacion_color\`: Color seleccionado
- \`cantidad\`: Items agregados
- \`precio_unitario\`: Precio snapshot al momento de agregar
- \`value\`: precio_unitario * cantidad

**Implementation**:

\`\`\`typescript
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
\`\`\`

---

#### 2. view_cart

Se dispara al abrir la página de carrito o el drawer.

**Parámetros:**

- \`event_category\`: "ecommerce"
- \`item_count\`: Cantidad total de items
- \`subtotal\`: Valor total del carrito
- \`value\`: subtotal

**Implementation**:

\`\`\`typescript
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
\`\`\`

---

#### 3. remove_from_cart

Se dispara cuando se elimina un ítem del carrito.

**Parámetros:**

- \`event_category\`: "ecommerce"
- \`producto_id\`: UUID del producto removido
- \`variacion_id\`: UUID de la variación removida
- \`cantidad\`: Items removidos
- \`value\`: Valor total del item removido

**Implementation**:

\`\`\`typescript
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
\`\`\`

---

### Debugging

- **DevTools** → Network → filtrar "google-analytics"
- **GA4 DebugView** (con extensión Google Analytics Debugger)
- **En dev**: GA4 no se carga (verificar con console.log)

**Common Issues**:

- ID mal configurado
- No estás en producción
- Adblockers bloqueando requests
- DevTools Network → Check para gtag requests

---

## 🔗 Integration Examples

### Complete Add to Cart Flow

\`\`\`typescript
'use client';
import { useCarrito } from '@/lib/context/CarritoContext';
import { trackAddToCart } from '@/lib/analytics/gtag';

export function ProductDetailContent({ producto }) {
  const [selectedVariacion, setSelectedVariacion] = useState<Variacion | null>(null);
  const { addItem, openDrawer } = useCarrito();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!selectedVariacion) return;

    setIsAdding(true);

    // 1. Add to cart
    addItem(producto, selectedVariacion, 1);

    // 2. Track analytics event
    trackAddToCart(
      producto,
      selectedVariacion,
      1,
      selectedVariacion.precio
    );

    // 3. Open drawer for confirmation
    openDrawer();

    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div>
      <VariationSelector
        variaciones={producto.variaciones.filter(v => v.activo)}
        onSelect={setSelectedVariacion}
      />

      <Button
        onClick={handleAddToCart}
        disabled={!selectedVariacion || isAdding}
      >
        {isAdding ? '✓ Agregado' : 'Agregar al carrito'}
      </Button>
    </div>
  );
}
\`\`\`

---

### Cart Drawer with Analytics

\`\`\`typescript
'use client';
import { useCarrito } from '@/lib/context/CarritoContext';
import { trackViewCart } from '@/lib/analytics/gtag';
import { useEffect } from 'react';

export function CartDrawer() {
  const { carritoWithDetails, isDrawerOpen, closeDrawer, itemCount } = useCarrito();

  // Track view_cart when drawer opens
  useEffect(() => {
    if (isDrawerOpen && itemCount > 0 && carritoWithDetails) {
      trackViewCart(itemCount, carritoWithDetails.subtotal);
    }
  }, [isDrawerOpen, itemCount, carritoWithDetails]);

  if (!isDrawerOpen) return null;

  return (
    <div className="cart-drawer">
      {/* Drawer content */}
    </div>
  );
}
\`\`\`

---

### Remove from Cart with Analytics

\`\`\`typescript
'use client';
import { useCarrito } from '@/lib/context/CarritoContext';
import { trackRemoveFromCart } from '@/lib/analytics/gtag';

export function CartItemCard({ item, producto, variacion }) {
  const { removeItem } = useCarrito();

  const handleRemove = () => {
    const itemValue = item.precio_unitario * item.cantidad;

    // 1. Remove from cart
    removeItem(item.id);

    // 2. Track analytics event
    trackRemoveFromCart(
      producto,
      variacion,
      item.cantidad,
      itemValue
    );
  };

  return (
    <div className="cart-item">
      {/* Item content */}
      <button onClick={handleRemove}>Remover</button>
    </div>
  );
}
\`\`\`

---

### Cart Page with Analytics

\`\`\`typescript
'use client';
import { useCarrito } from '@/lib/context/CarritoContext';
import { trackViewCart } from '@/lib/analytics/gtag';
import { useEffect } from 'react';

export function CarritoContent() {
  const { carritoWithDetails, itemCount } = useCarrito();

  // Track view_cart when page loads
  useEffect(() => {
    if (itemCount > 0 && carritoWithDetails) {
      trackViewCart(itemCount, carritoWithDetails.subtotal);
    }
  }, []); // Only on mount

  if (itemCount === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {carritoWithDetails?.items.map(item => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="lg:col-span-1">
        <CartSummary carrito={carritoWithDetails} />
      </div>
    </div>
  );
}
\`\`\`

---

## 📚 Related Documentation

- Business logic: \`.github/reference/business-logic.md\` (Cart Lifecycle)
- Analytics events: \`lib/analytics/events.ts\`
- Content: \`lib/content/carrito.ts\`
- Design tokens: \`lib/design/tokens.ts\` (COMPONENTS.carrito)
- [Google Analytics 4 Documentation](https://support.google.com/analytics)

---

## ✅ Best Practices Checklist

**Shopping Cart:**
- [ ] Validar variación seleccionada antes de agregar
- [ ] Snapshot precio al agregar (\`precio_unitario\`)
- [ ] Detectar cambios de precio y mostrar warning
- [ ] Mergear items duplicados (mismo producto+variación)
- [ ] Handle localStorage errors (Safari private mode)
- [ ] TTL de 14 días para expiración
- [ ] Focus trap en drawer (useEscapeKey, useScrollLock)
- [ ] Empty states con CTAs claros
- [ ] Loading states en botones (isAdding)

**Analytics:**
- [ ] \`NEXT_PUBLIC_GA_MEASUREMENT_ID\` configurado
- [ ] Eventos visibles en DebugView
- [ ] Tracking activo solo en prod
- [ ] add_to_cart se dispara al agregar producto
- [ ] view_cart se dispara al abrir drawer/página
- [ ] remove_from_cart se dispara al remover item
- [ ] item_count y subtotal correctos
- [ ] price snapshots guardados
- [ ] Test en DebugView → 24-48h para standard reports
