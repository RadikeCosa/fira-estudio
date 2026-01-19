---
title: "Supabase Queries - Muma Estudio"
description: "Query patterns for fetching products with relations and caching strategies"
version: "1.0"
lastUpdated: "2026-01-19"
activationTriggers:
  - "supabase"
  - "query"
  - "getProductos"
  - "database"
  - "filtrar"
  - "relaciones"
---

# Supabase Queries Skill

## 🎯 Quick Reference

Use **cached** queries for public pages, **fresh** queries for admin interfaces.

---

## 📚 Query Patterns

### Get Products with All Relations

```typescript
import { getProductos, getProductosFresh } from "@/lib/supabase/queries";

// ✅ Cached (1 hour for general, 2 hours for category-filtered)
const productos = await getProductos();
const { items, pagination } = await getProductos({ 
  page: 2, 
  pageSize: 12 
});
const manteles = await getProductos({ 
  categoriaSlug: "manteles",
  page: 1,
  pageSize: 20
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

### Get Single Product by Slug

```typescript
import { getProductoBySlug, getProductoBySlugFresh } from "@/lib/supabase/queries";

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

### Get Related Products

```typescript
import { getProductosRelacionados, getProductosRelacionadosFresh } from "@/lib/supabase/queries";

// ✅ Cached (1 hour) - default 4 products
const relacionados = await getProductosRelacionados(
  producto.id, 
  producto.categoria_id
);

// ✅ Custom limit
const relacionados = await getProductosRelacionados(
  producto.id,
  producto.categoria_id,
  6 // limite: 6 productos
);

// ✅ Fresh data
const relacionadosFresh = await getProductosRelacionadosFresh(
  producto.id,
  producto.categoria_id,
  4
);
```

**Returns**: `ProductoCompleto[]` (excludes current product, filters by category)

---

### Get Categories

```typescript
import { getCategorias, getCategoriasFresh } from "@/lib/supabase/queries";

// ✅ Cached (24 hours)
const categorias = await getCategorias();

// ✅ Fresh data
const categoriasFresh = await getCategoriasFresh();
```

**Returns**: `Categoria[]` (ordered by `orden` field)

---

## 🔄 Cache Strategy

### Cache Durations

| Query | Cache Duration | Use Case |
|-------|----------------|----------|
| `getProductos()` | 1 hour | General product listing |
| `getProductos({ categoriaSlug })` | 2 hours | Category-filtered (more stable) |
| `getProductoBySlug()` | 1 hour | Product detail page |
| `getProductosRelacionados()` | 1 hour | Related products |
| `getCategorias()` | 24 hours | Categories (rarely change) |

### When to Use Fresh Queries

Use `*Fresh()` variants when:
- Building admin interfaces
- Showing real-time inventory
- After data mutations (create/update/delete)
- Development/debugging

### Cache Invalidation

```typescript
import { revalidateProductos, revalidateProducto, revalidateCategorias } from "@/lib/cache/revalidate";

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

## ⚠️ Important Notes

### Cannot Order Nested Relations

Supabase does NOT support ordering nested relations in queries.

```typescript
// ❌ WRONG - This doesn't work
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)")
  .order("variaciones(precio)"); // ❌ Not supported!

// ✅ CORRECT - Sort in JavaScript after fetch
const { data } = await supabase
  .from("productos")
  .select("*, variaciones(*)");

data?.forEach(producto => {
  producto.variaciones.sort((a, b) => a.precio - b.precio);
});
```

**Repository Layer**: The `ProductoRepository` handles this automatically.

---

### Use `activo` Column (Not `disponible`)

```typescript
// ❌ WRONG - Column doesn't exist
.eq("disponible", true)

// ✅ CORRECT
.eq("activo", true)
```

---

### Always Handle Errors

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

## 🏗️ Repository Pattern

The project uses a repository layer for productos:

```typescript
// lib/repositories/producto.repository.ts
class ProductoRepository {
  async findAll(filters?: { 
    categoria?: string, 
    limit?: number, 
    offset?: number 
  }): Promise<{ items: ProductoCompleto[], total: number }> {
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

## 📚 Related Documentation

- Complete schema: `.github/reference/database-schema.md`
- Business rules: `.github/reference/business-logic.md`
- Cache configuration: `lib/cache/index.ts`
- TypeScript types: `lib/types.ts`

---

## ✅ Best Practices Checklist

- [ ] Use cached queries for public pages
- [ ] Use fresh queries for admin interfaces
- [ ] Always handle errors before using data
- [ ] Sort relations in JavaScript (not in query)
- [ ] Use `.eq("activo", true)` for active records
- [ ] Import correct client (`server.ts` vs `client.ts`)
- [ ] Use TypeScript types from `lib/types.ts`
- [ ] Handle not found cases with `notFound()`
