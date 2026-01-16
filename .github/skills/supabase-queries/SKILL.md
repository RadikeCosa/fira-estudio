---
name: supabase-queries-muma
description: Use when asked "cómo hacer queries con relaciones", "obtener productos con variaciones", "filtrar por categoría", "ordenar por precio", "consultas a Supabase", or working with Supabase database queries in Muma Estudio
---

# Supabase Queries Skill - Muma Estudio

Complete patterns for querying Supabase PostgreSQL database with relations, filtering, and error handling.

---

## How It Works

1. **Import the correct client** - Server Component uses `@/lib/supabase/server`, Client Component uses `@/lib/supabase/client`
2. **Build the query** - Use `.select()` with join syntax for relations
3. **Apply filters** - Chain `.eq()`, `.in()`, `.filter()` methods
4. **Execute** - Use `.single()` for one result or let it return array
5. **Handle errors** - Always check `error` before using `data`
6. **Sort relations in JavaScript** - Supabase cannot order nested data

---

## Core Patterns

### Get Single Product with All Relations

Complete query for product detail page:

```typescript
// app/productos/[slug]/page.tsx
import { createClient } from "@/lib/supabase/server";
import type { ProductoCompleto } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  
  // Query with all relations
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `)
    .eq("slug", params.slug)
    .eq("activo", true)
    .single(); // ⚠️ Throws error if no results or multiple results
  
  // Handle not found (error code PGRST116)
  if (error) {
    if (error.code === "PGRST116") {
      notFound(); // Triggers not-found.tsx
    }
    console.error("Database error:", error);
    throw error; // Triggers error.tsx
  }
  
  // ⚠️ CRITICAL: Sort relations in JavaScript
  // Supabase cannot order nested data with .order()
  data.variaciones.sort((a, b) => a.precio - b.precio);
  data.imagenes.sort((a, b) => {
    // Principal image first, then by orden
    if (a.es_principal) return -1;
    if (b.es_principal) return 1;
    return a.orden - b.orden;
  });
  
  const producto = data as ProductoCompleto;
  
  return <ProductoDetail producto={producto} />;
}
```

**Key Points:**
- ✅ Use `.single()` when expecting exactly one result
- ✅ Check `error.code === "PGRST116"` for "not found"
- ✅ Always sort relations in JavaScript after fetch
- ❌ Never use `.order('variaciones(precio)')` - it doesn't work

---

### Get Products List (Catalog)

For product listings with optional category filter:

```typescript
// lib/supabase/queries.ts
import { createClient } from "@/lib/supabase/server";
import type { ProductoCompleto } from "@/lib/types";

export async function getProductos(
  categoriaSlug?: string
): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
  
  // Build base query
  let query = supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `)
    .eq("activo", true)
    .order("destacado", { ascending: false }) // Featured first
    .order("nombre", { ascending: true });     // Then alphabetically
  
  // Optional: Filter by category
  if (categoriaSlug) {
    // First get category ID by slug
    const { data: categoria } = await supabase
      .from("categorias")
      .select("id")
      .eq("slug", categoriaSlug)
      .single();
    
    if (categoria) {
      query = query.eq("categoria_id", categoria.id);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching productos:", error);
    throw error;
  }
  
  // Sort nested relations (Supabase limitation)
  (data || []).forEach((producto) => {
    producto.variaciones.sort((a, b) => a.precio - b.precio);
    producto.imagenes.sort((a, b) => {
      if (a.es_principal) return -1;
      if (b.es_principal) return 1;
      return a.orden - b.orden;
    });
  });
  
  return (data as ProductoCompleto[]) || [];
}
```

**Usage:**
```typescript
// All active products
const productos = await getProductos();

// Products in specific category
const manteles = await getProductos("manteles");
```

---

### Get Featured Products

For home page or promotional sections:

```typescript
// lib/supabase/queries.ts
export async function getProductosDestacados(
  limite: number = 6
): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `)
    .eq("activo", true)
    .eq("destacado", true) // Only featured products
    .order("created_at", { ascending: false }) // Newest first
    .limit(limite);
  
  if (error) throw error;
  
  // Sort relations
  (data || []).forEach((producto) => {
    producto.variaciones.sort((a, b) => a.precio - b.precio);
    producto.imagenes.sort((a, b) => {
      if (a.es_principal) return -1;
      if (b.es_principal) return 1;
      return a.orden - b.orden;
    });
  });
  
  return (data as ProductoCompleto[]) || [];
}
```

---

### Get Categories

For navigation menu:

```typescript
// lib/supabase/queries.ts
import type { Categoria } from "@/lib/types";

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden", { ascending: true }); // Display order
  
  if (error) {
    console.error("Error fetching categorias:", error);
    throw error;
  }
  
  return data || [];
}
```

**Usage in Server Component:**
```typescript
// components/layout/Header.tsx
import { getCategorias } from "@/lib/supabase/queries";

export async function Header() {
  const categorias = await getCategorias();
  
  return (
    <nav>
      {categorias.map(categoria => (
        <Link key={categoria.id} href={`/productos/${categoria.slug}`}>
          {categoria.nombre}
        </Link>
      ))}
    </nav>
  );
}
```

---

### Get Price Range for Product

Useful for price display in cards:

```typescript
// lib/utils/product.ts
import type { Variacion } from "@/lib/types";

export function getPriceRange(variaciones: Variacion[]): {
  min: number;
  max: number;
  hasRange: boolean;
} {
  const variacionesActivas = variaciones.filter(v => v.activo);
  
  if (variacionesActivas.length === 0) {
    return { min: 0, max: 0, hasRange: false };
  }
  
  const precios = variacionesActivas.map(v => v.precio);
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  
  return {
    min,
    max,
    hasRange: min !== max,
  };
}
```

**Usage:**
```typescript
const { min, max, hasRange } = getPriceRange(producto.variaciones);

// Display
if (hasRange) {
  return <span>Desde ${min.toLocaleString('es-AR')}</span>;
} else {
  return <span>${min.toLocaleString('es-AR')}</span>;
}
```

---

## Error Handling Checklist

Always implement comprehensive error handling:

```typescript
export async function getProductoBySlug(
  slug: string
): Promise<ProductoCompleto | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `)
    .eq("slug", slug)
    .eq("activo", true)
    .single();
  
  // ✅ Handle specific error: Not found
  if (error) {
    if (error.code === "PGRST116") {
      return null; // Product not found
    }
    
    // ✅ Log unexpected errors
    console.error("Unexpected database error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    
    // ✅ Re-throw to trigger error boundary
    throw error;
  }
  
  // ✅ Type guard: Ensure data exists
  if (!data) {
    return null;
  }
  
  // ✅ Sort relations
  data.variaciones.sort((a, b) => a.precio - b.precio);
  data.imagenes.sort((a, b) => {
    if (a.es_principal) return -1;
    if (b.es_principal) return 1;
    return a.orden - b.orden;
  });
  
  return data as ProductoCompleto;
}
```

**Error Codes to Handle:**
- `PGRST116` - Not found (no rows returned for `.single()`)
- `23503` - Foreign key violation
- `23505` - Unique constraint violation
- `42P01` - Table doesn't exist
- `42703` - Column doesn't exist

---

## Common Filters

### Filter by Active Status

```typescript
// Only active products
.eq("activo", true)

// Include inactive (admin view)
// Don't add the filter
```

### Filter by Category

```typescript
// Option 1: By category ID (if you have it)
.eq("categoria_id", "uuid-here")

// Option 2: By category slug (two-step query)
const { data: categoria } = await supabase
  .from("categorias")
  .select("id")
  .eq("slug", "manteles")
  .single();

if (categoria) {
  query = query.eq("categoria_id", categoria.id);
}
```

### Filter by Featured

```typescript
.eq("destacado", true)
```

### Filter by Multiple Values

```typescript
// Products in multiple categories
.in("categoria_id", ["uuid-1", "uuid-2", "uuid-3"])

// Variations with specific colors
.in("color", ["Rojo", "Azul", "Verde"])
```

### Filter with OR Logic

```typescript
// Products that are featured OR in a specific category
.or("destacado.eq.true,categoria_id.eq.uuid-here")
```

### Filter by Date Range

```typescript
// Products created in last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

.gte("created_at", thirtyDaysAgo.toISOString())
```

### Filter by Price Range (Variations)

```typescript
// ⚠️ Complex: Requires filtering after fetch
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)");

const productosEnRango = data.filter(producto => {
  return producto.variaciones.some(v =>
    v.precio >= precioMin && v.precio <= precioMax
  );
});
```

---

## Sorting Patterns

### Sort Products (Parent Table)

```typescript
// ✅ Works: Sort parent table
.order("nombre", { ascending: true })
.order("destacado", { ascending: false })
.order("created_at", { ascending: false })
```

### Sort Relations (Nested Data)

```typescript
// ❌ DOESN'T WORK: Cannot order nested relations
.order("variaciones(precio)", { ascending: true }) // ERROR!

// ✅ SOLUTION: Sort in JavaScript after fetch
data.forEach(producto => {
  // Sort variations by price (ascending)
  producto.variaciones.sort((a, b) => a.precio - b.precio);
  
  // Sort images (principal first, then by orden)
  producto.imagenes.sort((a, b) => {
    if (a.es_principal) return -1;
    if (b.es_principal) return 1;
    return a.orden - b.orden;
  });
});
```

### Complex Sorting

```typescript
// Sort by multiple criteria
producto.variaciones.sort((a, b) => {
  // First by active status
  if (a.activo !== b.activo) {
    return a.activo ? -1 : 1;
  }
  // Then by price
  return a.precio - b.precio;
});
```

---

## Type Safety

### Import Types

```typescript
// ✅ Always import types explicitly
import type { Producto, ProductoCompleto, Variacion, Categoria } from "@/lib/types";

// ❌ Never use 'any'
const producto: any = await getProducto(); // BAD!
```

### Type Assertions

```typescript
// ✅ Use type assertion after validation
const { data, error } = await supabase
  .from("productos")
  .select("*, categoria:categorias(*), variaciones(*)")
  .single();

if (error) throw error;

// Assert type after confirming data exists
const producto = data as ProductoCompleto;
```

### Generic Query Function

```typescript
// Advanced: Generic query wrapper with type safety
async function fetchFromTable<T>(
  table: string,
  options?: {
    filter?: Record<string, any>;
    order?: { column: string; ascending: boolean };
    limit?: number;
  }
): Promise<T[]> {
  const supabase = await createClient();
  
  let query = supabase.from(table).select("*");
  
  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending,
    });
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return (data as T[]) || [];
}

// Usage
const categorias = await fetchFromTable<Categoria>("categorias", {
  order: { column: "orden", ascending: true },
});
```

---

## Performance Tips

### 1. Select Only Needed Columns

```typescript
// ❌ BAD: Fetch everything
.select("*")

// ✅ GOOD: Specify columns
.select("id, nombre, slug, precio_desde")

// ✅ BETTER: With relations
.select(`
  id, nombre, slug,
  categoria:categorias(nombre, slug),
  variaciones(tamanio, color, precio, stock)
`)
```

### 2. Use Limits

```typescript
// Pagination
.range(0, 9) // First 10 items (0-indexed)
.range(10, 19) // Next 10 items

// Simple limit
.limit(6) // First 6 items
```

### 3. Use Inner Joins for Required Relations

```typescript
// ⚠️ !inner forces inner join (excludes products without variations)
.select(`
  *,
  variaciones!inner(*)
`)
// Only returns products that have at least one variation
```

### 4. Cache Queries (Next.js 15)

```typescript
// Page-level caching
export const revalidate = 3600; // Cache for 1 hour

export default async function ProductosPage() {
  const productos = await getProductos(); // Cached automatically
  return <ProductGrid productos={productos} />;
}
```

### 5. Avoid N+1 Queries

```typescript
// ❌ BAD: Separate queries for each product
const productos = await getProductos();
for (const producto of productos) {
  const variaciones = await getVariacionesByProductoId(producto.id); // N+1!
}

// ✅ GOOD: Single query with joins
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)");
```

---

## Troubleshooting

### Issue: `.single()` throws error even though data exists

**Cause:** Multiple rows returned when expecting one.

**Solution:**
```typescript
// Add unique constraint to query
.eq("slug", slug) // Ensure slug is unique in database
.single()

// Or use array and take first
.eq("slug", slug)
.limit(1)
// Then: const producto = data[0]
```

---

### Issue: Relations come back empty

**Cause:** Foreign key mismatch or inactive related records.

**Solution:**
```typescript
// Check foreign key in database
SELECT * FROM productos WHERE id = 'producto-id';
SELECT * FROM variaciones WHERE producto_id = 'producto-id';

// In query, don't filter related table unnecessarily
.select(`
  *,
  variaciones(*) // Don't add .eq("activo", true) here
`)
// Filter in JavaScript instead:
producto.variaciones = producto.variaciones.filter(v => v.activo);
```

---

### Issue: "column does not exist" error

**Cause:** Typo in column name or table name.

**Solution:**
```typescript
// ✅ Correct column names (check database schema)
.select("categoria_id") // Not "categoriaId"
.select("es_principal") // Not "esPrincipal"

// Use schema reference for accuracy
// See: .github/reference/database-schema.md
```

---

### Issue: Cannot order nested relations

**Expected Behavior:** This is a Supabase/PostgREST limitation.

**Solution:**
```typescript
// ❌ This doesn't work
.order("variaciones(precio)", { ascending: true })

// ✅ Always sort in JavaScript
data.forEach(producto => {
  producto.variaciones.sort((a, b) => a.precio - b.precio);
});
```

---

## Related Resources

- Database Schema: `.github/reference/database-schema.md`
- TypeScript Types: `lib/types.ts`
- Query Functions: `lib/supabase/queries.ts`
- Supabase Clients: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Business Logic: `.github/reference/business-logic.md`
