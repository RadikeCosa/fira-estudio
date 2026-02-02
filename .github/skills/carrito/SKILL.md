---
title: "Carrito de Compras - Fira Estudio"
description: "Shopping cart patterns with localStorage, Context API, and hybrid drawer/page UX"
version: "1.1"
lastUpdated: "2026-02-02"
activationTriggers:
  # Spanish
  - "carrito"
  - "carro"
  - "agregar"
  - "añadir"
  - "compra"
  - "comprar"
  
  # English
  - "cart"
  - "basket"
  - "add to"
  - "checkout"
  - "shopping"
  
  # Technical
  - "localStorage"
  - "Context API"
  - "items"
---

# Carrito de Compras Skill

## 🎯 Quick Reference

**Arquitectura**: Context API + localStorage (anónimo)
**UX**: Drawer (agregar rápido) + Página (checkout completo)
**Persistencia**: 14 días en localStorage

---

## 📐 Business Rules

### Key Concepts

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

## 🗂️ Data Structure

### CarritoItem

```typescript
interface CarritoItem {
  id: string; // UUID cliente (crypto.randomUUID())
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number; // Snapshot al agregar
  agregado_at: string; // ISO timestamp
}
```

### Carrito

```typescript
interface Carrito {
  items: CarritoItem[];
  subtotal: number; // Calculado: sum(item.precio_unitario * item.cantidad)
  created_at: string;
  updated_at: string;
}
```

### CarritoWithDetails

```typescript
interface CarritoWithDetails extends Carrito {
  items: (CarritoItem & {
    producto: ProductoCompleto;
    variacion: Variacion;
  })[];
}
```

---

## 💾 LocalStorage Manager

### Location

`lib/storage/carrito.ts`

### Key Functions

```typescript
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
```

### Error Handling

```typescript
try {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
} catch (error) {
  // QuotaExceededError, Safari private mode
  console.error("localStorage error:", error);
  // Fallback: usar estado en memoria (se pierde al recargar)
  return getInMemoryCarrito();
}
```

---

## 🧩 Context API

### Location

`lib/context/CarritoContext.tsx`

### Interface

```typescript
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
```

### Provider Setup

```typescript
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
```

### Usage in Components

```typescript
"use client";
import { useCarrito } from "@/lib/context/CarritoContext";

export function AddToCartButton() {
  const { addItem, openDrawer } = useCarrito();

  const handleAdd = () => {
    addItem(producto, variacion, 1);
    openDrawer(); // Abre drawer automáticamente
  };
}
```

---

## 🎨 Component Patterns

### CartBadge (Header)

**Location**: `components/carrito/CartBadge.tsx`

```typescript
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
```

---

### AddToCartButton

**Location**: `components/carrito/AddToCartButton.tsx`

```typescript
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
```

---

### CartItemCard

**Location**: `components/carrito/CartItemCard.tsx`

```typescript
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
```

---

### CartDrawer

**Location**: `components/carrito/CartDrawer.tsx`

```typescript
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
```

---

### Página /carrito

**Location**: `app/carrito/page.tsx`

```typescript
export default function CarritoPage() {
  return (
    <main className="min-h-screen py-12">
      <Breadcrumbs items={[
        { name: 'Productos', url: '/productos' },
        { name: 'Carrito', url: '/carrito' }
      ]} />

      <Suspense fallback={<CarritoSkeleton />}>
        <CarritoContent />
      </Suspense>
    </main>
  );
}
```

**Location**: `components/carrito/CarritoContent.tsx`

```typescript
'use client';

export function CarritoContent() {
  const { carritoWithDetails, itemCount } = useCarrito();

  if (itemCount === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista de items */}
      <div className="lg:col-span-2 space-y-4">
        {carritoWithDetails?.items.map(item => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <CartSummary carrito={carritoWithDetails} />
      </div>
    </div>
  );
}
```

---

## 📊 Analytics

### Track Events

```typescript
import {
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
} from "@/lib/analytics/gtag";

// Al agregar
trackAddToCart(producto, variacion, cantidad);

// Al eliminar
trackRemoveFromCart(producto, variacion);

// Al abrir página /carrito
trackViewCart(carrito);

// Al iniciar checkout (Fase 2)
trackBeginCheckout(carrito);
```

---

## ⚠️ Validation Rules

### Al Agregar

```typescript
function validateAddToCart(variacion: Variacion | null): string | null {
  if (!variacion) {
    return "Seleccioná una variación";
  }

  if (!variacion.activo) {
    return "Esta variación no está disponible";
  }

  return null; // Valid
}
```

### En Carrito

```typescript
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
```

---

## 🔄 Merging Items

Si usuario agrega mismo producto+variación 2 veces:

```typescript
function mergeItems(existing: CarritoItem, nuevo: CarritoItem): CarritoItem {
  // Sumar cantidades
  return {
    ...existing,
    cantidad: existing.cantidad + nuevo.cantidad,
    updated_at: new Date().toISOString(),
  };
}
```

---

## 📚 Related Documentation

- Business logic: `.github/reference/business-logic.md` (Cart Lifecycle)
- Analytics events: `lib/analytics/events.ts`
- Content: `lib/content/carrito.ts`
- Design tokens: `lib/design/tokens.ts` (COMPONENTS.carrito)

---

## ✅ Best Practices Checklist

- [ ] Validar variación seleccionada antes de agregar
- [ ] Snapshot precio al agregar (`precio_unitario`)
- [ ] Detectar cambios de precio y mostrar warning
- [ ] Mergear items duplicados (mismo producto+variación)
- [ ] Trackear eventos de analytics
- [ ] Handle localStorage errors (Safari private mode)
- [ ] TTL de 14 días para expiración
- [ ] Focus trap en drawer (useEscapeKey, useScrollLock)
- [ ] Empty states con CTAs claros
- [ ] Loading states en botones (isAdding)
