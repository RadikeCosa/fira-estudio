---
title: "Data Layer - Fira Estudio"
description: "Supabase queries, product variations, and data fetching patterns"
version: "2.0"
lastUpdated: "2026-02-02"
activationTriggers:
  # Database Operations
  - "supabase"
  - "query"
  - "consulta"
  - "base de datos"
  - "database"
  - "fetch"
  - "filtrar"
  - "filter"
  - "ordenar"
  - "sort"
  - "getProductos"
  - "getProductoBySlug"
  - "relaciones"
  - "relations"
  
  # Product Variations
  - "variacion"
  - "variación"
  - "variation"
  - "tamaño"
  - "size"
  - "color"
  - "precio"
  - "price"
  - "stock"
  - "selector"
  - "VariationSelector"
  - "ProductoCompleto"
---

# Data Layer Skill

## 🎯 Quick Reference

This skill covers **database queries** and **product variation handling** - two tightly coupled concepts in Fira Estudio.

**Key Principles:**
- Use **cached** queries for public pages, **fresh** queries for admin interfaces
- Prices and stock are **per variation**, not per product
- `stock = 0` means "available on request", not out of stock
- Sort relations in **JavaScript** (Supabase limitation)

---

## 📚 Part 1: Supabase Queries

### Query Patterns

#### Get Products with All Relations

```typescript
import { getProductos, getProductosFresh } from "@/lib/supabase/queries";

// ✅ Cached (1 hour for general, 2 hours for category-filtered)
const productos = await getProductos();
const { items, pagination } = await getProductos({
  page: 2,
  pageSize: 12,
});
const manteles = await getProductos({
  categoriaSlug: "manteles",
  page: 1,
  pageSize: 20,
});

// ✅ Fresh data (admin/dashboard)
const productosFresh = await getProductosFresh();
const { items } = await getProductosFresh({ categoriaSlug: "manteles" });
```

**Returns**: `PaginatedResult<ProductoCompleto>`

```typescript
{
  items: ProductoCompleto[], // productos con categoria, variaciones, imagenes
  pagination: {
    total: number,
    page: number,
    pageSize: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

---

#### Get Single Product by Slug

```typescript
import {
  getProductoBySlug,
  getProductoBySlugFresh,
} from "@/lib/supabase/queries";

// ✅ Cached (1 hour)
const producto = await getProductoBySlug("mantel-floral");

// ✅ Fresh data
const productoFresh = await getProductoBySlugFresh("mantel-floral");

// Handle not found
if (!producto) {
  notFound(); // Triggers not-found.tsx
}
```

**Returns**: `ProductoCompleto | null`

---

#### Get Related Products

```typescript
import {
  getProductosRelacionados,
  getProductosRelacionadosFresh,
} from "@/lib/supabase/queries";

// ✅ Cached (1 hour) - default 4 products
const relacionados = await getProductosRelacionados(
  producto.id,
  producto.categoria_id,
);

// ✅ Custom limit
const relacionados = await getProductosRelacionados(
  producto.id,
  producto.categoria_id,
  6, // limite: 6 productos
);

// ✅ Fresh data
const relacionadosFresh = await getProductosRelacionadosFresh(
  producto.id,
  producto.categoria_id,
  4,
);
```

**Returns**: `ProductoCompleto[]` (excludes current product, filters by category)

---

#### Get Categories

```typescript
import { getCategorias, getCategoriasFresh } from "@/lib/supabase/queries";

// ✅ Cached (24 hours)
const categorias = await getCategorias();

// ✅ Fresh data
const categoriasFresh = await getCategoriasFresh();
```

**Returns**: `Categoria[]` (ordered by `orden` field)

---

### Cache Strategy

#### Cache Durations

| Query                             | Cache Duration | Use Case                        |
| --------------------------------- | -------------- | ------------------------------- |
| `getProductos()`                  | 1 hour         | General product listing         |
| `getProductos({ categoriaSlug })` | 2 hours        | Category-filtered (more stable) |
| `getProductoBySlug()`             | 1 hour         | Product detail page             |
| `getProductosRelacionados()`      | 1 hour         | Related products                |
| `getCategorias()`                 | 24 hours       | Categories (rarely change)      |

#### When to Use Fresh Queries

Use `*Fresh()` variants when:

- Building admin interfaces
- Showing real-time inventory
- After data mutations (create/update/delete)
- Development/debugging

#### Cache Invalidation

```typescript
import {
  revalidateProductos,
  revalidateProducto,
  revalidateCategorias,
} from "@/lib/cache/revalidate";

// After updating multiple products
await updateMultipleProductos(data);
revalidateProductos(); // Clears all product caches

// After updating a single product
await updateProducto(id, data);
revalidateProducto(producto.slug); // Clears specific product cache

// After updating categories
await updateCategoria(id, data);
revalidateCategorias(); // Clears category cache
```

---

### Important Query Notes

#### Cannot Order Nested Relations

Supabase does NOT support ordering nested relations in queries.

```typescript
// ❌ WRONG - This doesn't work
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)")
  .order("variaciones(precio)"); // ❌ Not supported!

// ✅ CORRECT - Sort in JavaScript after fetch
const { data } = await supabase.from("productos").select("*, variaciones(*)");

data?.forEach((producto) => {
  producto.variaciones.sort((a, b) => a.precio - b.precio);
});
```

**Repository Layer**: The `ProductoRepository` handles this automatically.

---

#### Use `activo` Column (Not `disponible`)

```typescript
// ❌ WRONG - Column doesn't exist
.eq("disponible", true)

// ✅ CORRECT
.eq("activo", true)
```

---

#### Always Handle Errors

```typescript
const { data, error } = await supabase
  .from("productos")
  .select("*")
  .eq("slug", slug)
  .single();

if (error) {
  // Handle not found
  if (error.code === "PGRST116") {
    return notFound();
  }

  // Log and throw other errors
  console.error("Database error:", error);
  throw error;
}
```

---

### Repository Pattern

The project uses a repository layer for productos:

```typescript
// lib/repositories/producto.repository.ts
class ProductoRepository {
  async findAll(filters?: {
    categoria?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ProductoCompleto[]; total: number }> {
    // Handles ordering relations in JavaScript
  }
}
```

**Benefits**:

- Encapsulates Supabase complexity
- Handles relation sorting automatically
- Consistent error handling
- Type-safe filtering

---

## 📚 Part 2: Product Variations

### Business Rules

#### Key Concepts

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

### Components

#### VariationSelector Component

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

#### ProductActions Component

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

### Price Display

#### In Product Cards (Listing)

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

#### In Product Detail

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

### Stock Management

#### Display Logic

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

#### Filter Active Variations

```typescript
const variacionesActivas = producto.variaciones.filter((v) => v.activo);
```

**Always filter** before displaying in UI.

---

### Variation Selector Patterns

#### Group by Size, then Color

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

#### Find Variation by Size + Color

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

### Analytics

#### Track Variation Selection

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

## 🔗 Integration Examples

### Fetching and Displaying Products with Variations

```typescript
// Server Component - Fetch products with variations
export default async function ProductosPage() {
  const { items, pagination } = await getProductos({
    page: 1,
    pageSize: 12,
  });

  return (
    <main>
      <ProductGrid productos={items} />
      <Pagination {...pagination} />
    </main>
  );
}

// Client Component - Display with variation selection
'use client';
export function ProductCard({ producto }) {
  const variacionesActivas = producto.variaciones.filter(v => v.activo);
  
  // Sort by price (in JavaScript, not query)
  variacionesActivas.sort((a, b) => a.precio - b.precio);
  
  return (
    <article>
      <h3>{producto.nombre}</h3>
      <p>Desde {formatPrice(producto.precio_desde)}</p>
      <p>{variacionesActivas.length} variaciones disponibles</p>
    </article>
  );
}
```

---

### Complete Product Detail Flow

```typescript
// Server Component - Fetch product with all relations
export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const producto = await getProductoBySlug(params.slug);
  
  if (!producto) {
    notFound();
  }

  return (
    <main>
      <ProductDetailContent producto={producto} />
    </main>
  );
}

// Client Component - Handle variation selection
'use client';
export function ProductDetailContent({ producto }) {
  const [selectedVariacion, setSelectedVariacion] = useState<Variacion | null>(null);
  
  // Filter and sort variations
  const variacionesActivas = producto.variaciones
    .filter(v => v.activo)
    .sort((a, b) => a.precio - b.precio);

  const displayPrice = selectedVariacion?.precio ?? producto.precio_desde;

  return (
    <div>
      <h1>{producto.nombre}</h1>
      <p className="text-2xl">{formatPrice(displayPrice)}</p>
      
      <VariationSelector
        variaciones={variacionesActivas}
        onSelect={(v) => {
          setSelectedVariacion(v);
          trackVariationSelect(producto, v);
        }}
      />

      {selectedVariacion && (
        <div>
          <p>Tamaño: {selectedVariacion.tamanio}</p>
          <p>Color: {selectedVariacion.color}</p>
          <p>{getStockLabel(selectedVariacion.stock)}</p>
        </div>
      )}

      <ProductActions
        producto={producto}
        variacion={selectedVariacion}
      />
    </div>
  );
}
```

---

### Category Filtering with Variations

```typescript
// Server Component with category filter
export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const { items } = await getProductos({
    categoriaSlug: params.slug,
    pageSize: 20,
  });

  // Products already include variations, sorted by repository
  return (
    <main>
      <h1>{params.slug}</h1>
      <ProductGrid productos={items} />
    </main>
  );
}
```

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

### ❌ WRONG: Order Relations in Query

```typescript
// ❌ Supabase doesn't support this
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)")
  .order("variaciones(precio)"); // ❌ Doesn't work!
```

### ✅ CORRECT: Sort in JavaScript

```typescript
// ✅ Sort after fetch
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)");

data?.forEach((producto) => {
  producto.variaciones.sort((a, b) => a.precio - b.precio);
});
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

- Complete schema: `.github/reference/database-schema.md`
- Business rules: `.github/reference/business-logic.md`
- Cache configuration: `lib/cache/index.ts`
- Analytics tracking: `lib/analytics/gtag.ts`
- TypeScript types: `lib/types.ts`

---

## ✅ Best Practices Checklist

**Queries:**
- [ ] Use cached queries for public pages
- [ ] Use fresh queries for admin interfaces
- [ ] Always handle errors before using data
- [ ] Sort relations in JavaScript (not in query)
- [ ] Use `.eq("activo", true)` for active records
- [ ] Import correct client (`server.ts` vs `client.ts`)
- [ ] Handle not found cases with `notFound()`

**Variations:**
- [ ] Prices come from variations, not products
- [ ] Filter out inactive variations (`activo = false`)
- [ ] Show "Bajo pedido" for `stock = 0`
- [ ] Track variation selections with analytics
- [ ] Use `precio_desde` for product card listings
- [ ] Sort variations consistently
- [ ] Handle no-variations case gracefully
- [ ] Include variation details in WhatsApp messages
