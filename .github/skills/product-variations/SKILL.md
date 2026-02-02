---
title: "Product Variations - Fira Estudio"
description: "Handling product variations with size, color, price, and stock management"
version: "1.1"
lastUpdated: "2026-02-02"
activationTriggers:
  # Spanish
  - "variacion"
  - "variación"
  - "tamaño"
  - "tamaño"
  - "color"
  - "precio"
  - "stock"
  - "selector"
  
  # English
  - "variation"
  - "size"
  - "color"
  - "price"
  - "stock"
  
  # Technical
  - "VariationSelector"
---

# Product Variations Skill

## 🎯 Quick Reference

Prices and stock are **per variation**, not per product. `stock = 0` means "available on request", not out of stock.

---

## 📐 Business Rules

### Key Concepts

1. **Prices are per variation**, not per product
   - Each size/color combination has its own price
   - `producto.precio_desde` is for display only (minimum price)

2. **Stock = 0 is valid**
   - Means "available on request" (made to order)
   - NOT the same as "out of stock"
   - These variations should still be selectable

3. **Inactive variations are hidden**
   - `variacion.activo = false` → Don't display
   - Used to temporarily disable a variation

4. **Each product can have multiple combinations**
   - Example: Mantel Floral
     - 150x200cm + Rojo → $15,000
     - 150x200cm + Azul → $15,000
     - 180x250cm + Rojo → $18,500
     - 180x250cm + Azul → $18,500

---

## 🧩 Components

### VariationSelector Component

Located at: `components/productos/VariationSelector.tsx`

**Purpose**: Allow users to select size and color combinations.

**Usage**:

```typescript
'use client';
import { VariationSelector } from "@/components/productos/VariationSelector";

export function ProductDetail({ producto }) {
  const [selectedVariacion, setSelectedVariacion] = useState<Variacion | null>(null);

  return (
    <div>
      <VariationSelector
        variaciones={producto.variaciones}
        onSelect={setSelectedVariacion}
      />

      {selectedVariacion && (
        <div>
          <p>Precio: {formatPrice(selectedVariacion.precio)}</p>
          <p>Stock: {selectedVariacion.stock || "Bajo pedido"}</p>
        </div>
      )}
    </div>
  );
}
```

**Props**:

- `variaciones: Variacion[]` - All active variations
- `onSelect: (variacion: Variacion) => void` - Callback when user selects

---

### ProductActions Component

Located at: `components/productos/ProductActions.tsx`

**Purpose**: WhatsApp button with selected variation context.

**Usage**:

```typescript
import { ProductActions } from "@/components/productos/ProductActions";

export function ProductDetail({ producto }) {
  const [selectedVariacion, setSelectedVariacion] = useState<Variacion | null>(null);

  return (
    <div>
      <VariationSelector
        variaciones={producto.variaciones}
        onSelect={setSelectedVariacion}
      />

      <ProductActions
        producto={producto}
        variacion={selectedVariacion}
      />
    </div>
  );
}
```

**Features**:

- Generates WhatsApp message with variation details
- Tracks analytics with `trackWhatsAppClick(producto, variacion)`
- Shows price from selected variation
- Handles rate limiting

---

## 💰 Price Display

### In Product Cards (Listing)

```typescript
import { formatPrice } from "@/lib/utils";

export function ProductCard({ producto }) {
  return (
    <div>
      <h3>{producto.nombre}</h3>
      <p>Desde {formatPrice(producto.precio_desde)}</p>
    </div>
  );
}
```

**Note**: Use `precio_desde` (minimum price) in listings.

---

### In Product Detail

```typescript
export function ProductDetail({ producto }) {
  const [selectedVariacion, setSelectedVariacion] = useState<Variacion | null>(null);

  // Show selected variation price or default to precio_desde
  const displayPrice = selectedVariacion?.precio ?? producto.precio_desde;

  return (
    <div>
      <p>{formatPrice(displayPrice)}</p>
    </div>
  );
}
```

---

## 📦 Stock Management

### Display Logic

```typescript
function getStockLabel(stock: number): string {
  if (stock === 0) return "Bajo pedido";
  if (stock < 5) return `Últimas ${stock} unidades`;
  return "Disponible";
}

// Usage
<p className="text-sm text-muted-foreground">
  {getStockLabel(variacion.stock)}
</p>
```

### Filter Active Variations

```typescript
const variacionesActivas = producto.variaciones.filter((v) => v.activo);
```

**Always filter** before displaying in UI.

---

## 🎨 Variation Selector Patterns

### Group by Size, then Color

```typescript
// Get unique sizes
const tamanios = [...new Set(variaciones.map((v) => v.tamanio))];

// For each size, get available colors
const coloresPorTamanio = tamanios.reduce(
  (acc, tamanio) => {
    acc[tamanio] = variaciones
      .filter((v) => v.tamanio === tamanio && v.activo)
      .map((v) => v.color);
    return acc;
  },
  {} as Record<string, string[]>,
);
```

### Find Variation by Size + Color

```typescript
function findVariacion(
  variaciones: Variacion[],
  tamanio: string,
  color: string,
): Variacion | undefined {
  return variaciones.find(
    (v) => v.tamanio === tamanio && v.color === color && v.activo,
  );
}
```

---

## 🔍 Query Patterns

### Get Product with Variations

```typescript
import { getProductoBySlug } from "@/lib/supabase/queries";

const producto = await getProductoBySlug("mantel-floral");

// Variations are included automatically
producto.variaciones.forEach((v) => {
  console.log(`${v.tamanio} - ${v.color}: ${v.precio}`);
});
```

### Sort Variations

**By Price** (ascending):

```typescript
producto.variaciones.sort((a, b) => a.precio - b.precio);
```

**By Size, then Color**:

```typescript
producto.variaciones.sort((a, b) => {
  if (a.tamanio !== b.tamanio) {
    return a.tamanio.localeCompare(b.tamanio);
  }
  return a.color.localeCompare(b.color);
});
```

---

## 📊 Analytics

### Track Variation Selection

```typescript
import { trackVariationSelect } from "@/lib/analytics/gtag";

function handleVariationSelect(variacion: Variacion) {
  trackVariationSelect(producto, variacion);
  setSelectedVariacion(variacion);
}
```

**Tracked Data**:

- `producto_id`, `variacion_id`
- `variacion_tamanio`, `variacion_color`, `variacion_precio`
- `value` (price for conversion tracking)

---

## ⚠️ Common Mistakes

### ❌ WRONG: Price from Product

```typescript
// ❌ Don't use product price
<p>{formatPrice(producto.precio)}</p> // No existe!
```

### ✅ CORRECT: Price from Variation

```typescript
// ✅ Use variation price or precio_desde
<p>{formatPrice(variacion.precio)}</p>
<p>Desde {formatPrice(producto.precio_desde)}</p>
```

---

### ❌ WRONG: Treat stock = 0 as Out of Stock

```typescript
// ❌ Don't hide stock = 0
{variacion.stock > 0 && <Button>Consultar</Button>}
```

### ✅ CORRECT: Show "Bajo pedido"

```typescript
// ✅ All active variations are available
{variacion.activo && (
  <div>
    <Button>Consultar</Button>
    <p>{variacion.stock === 0 ? "Bajo pedido" : "En stock"}</p>
  </div>
)}
```

---

### ❌ WRONG: Hardcoded Size/Color Lists

```typescript
// ❌ Don't hardcode
const sizes = ["150x200cm", "180x250cm"];
```

### ✅ CORRECT: Extract from Variations

```typescript
// ✅ Extract unique sizes
const sizes = [...new Set(variaciones.map((v) => v.tamanio))];
```

---

## 📚 Related Documentation

- Business logic: `.github/reference/business-logic.md`
- Database schema: `.github/reference/database-schema.md`
- Supabase queries: `.github/skills/supabase-queries/SKILL.md`
- Analytics tracking: `lib/analytics/gtag.ts`
- TypeScript types: `lib/types.ts`

---

## ✅ Best Practices Checklist

- [ ] Prices come from variations, not products
- [ ] Filter out inactive variations (`activo = false`)
- [ ] Show "Bajo pedido" for `stock = 0`
- [ ] Track variation selections with analytics
- [ ] Use `precio_desde` for product card listings
- [ ] Sort variations consistently
- [ ] Handle no-variations case gracefully
- [ ] Include variation details in WhatsApp messages
