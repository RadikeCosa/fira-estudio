# Cache Layer Documentation

## Overview

The cache layer combines React's `cache()` for request-level deduplication with Next.js's `unstable_cache()` for cross-request persistence.

## Configuration

Cache settings are defined in `lib/cache/index.ts`:

```typescript
export const CACHE_CONFIG = {
  productos: {
    revalidate: 3600, // 1 hour
    tags: ["productos"],
  },
  productos_filtrados: {
    revalidate: 7200, // 2 hours (for category-filtered queries)
    tags: ["productos"],
  },
  categorias: {
    revalidate: 86400, // 24 hours
    tags: ["categorias"],
  },
  producto_detail: {
    revalidate: 3600, // 1 hour
    tags: ["productos"],
  },
  productos_relacionados: {
    revalidate: 3600, // 1 hour
    tags: ["productos"],
  },
};
```

## Usage

### Automatic Cache Selection

The `getProductos()` function automatically selects the appropriate cache configuration:

```typescript
import { getProductos } from "@/lib/supabase/queries";

// General listing - uses 'productos' config (1 hour)
const productos = await getProductos();
const productosPage2 = await getProductos({ page: 2 });

// Category-filtered - uses 'productos_filtrados' config (2 hours)
const manteles = await getProductos({ categoriaSlug: "manteles" });
const cojines = await getProductos({ categoriaSlug: "cojines", page: 2 });
```

**Why longer cache for filtered queries?**
- Category-filtered results are more stable (products don't move between categories frequently)
- Categories themselves rarely change
- Reduces database load for commonly visited category pages
- Manual invalidation still available via `revalidateProductos()`

### In Server Components

The cache is automatically applied to public-facing queries:

```typescript
import { getProductos, getCategorias, getProductoBySlug, getProductosRelacionados } from "@/lib/supabase/queries";

// These use cache automatically
const productos = await getProductos();
const categorias = await getCategorias();
const producto = await getProductoBySlug("mantel-floral");
const relacionados = await getProductosRelacionados(producto.id, producto.categoria_id);
```

### Fresh (Non-Cached) Queries

For admin interfaces or when fresh data is required:

```typescript
import { getProductosFresh, getCategoriasFresh, getProductoBySlugFresh, getProductosRelacionadosFresh } from "@/lib/supabase/queries";

// These bypass cache
const productos = await getProductosFresh();
const categorias = await getCategoriasFresh();
const producto = await getProductoBySlugFresh("mantel-floral");
const relacionados = await getProductosRelacionadosFresh(producto.id, producto.categoria_id);
```

## Cache Revalidation

After data mutations (create, update, delete), invalidate the cache:

```typescript
import { revalidateProductos, revalidateProducto, revalidateCategorias } from "@/lib/cache/revalidate";

// After updating multiple products
await updateMultipleProductos(data);
revalidateProductos();

// After updating a single product
await updateProducto(id, data);
revalidateProducto(producto.slug);

// After updating categories
await updateCategoria(id, data);
revalidateCategorias();
```

## Development Mode

Cache is **automatically disabled** in development (`NODE_ENV === 'development'`) to ensure fresh data during development.

## Repository Layer

The `ProductoRepository` provides both cached and non-cached methods:

```typescript
const repository = new ProductoRepository();

// Cached methods (for public pages)
const result = await repository.findAllCached({ categoria: "manteles" });
const producto = await repository.findBySlugCached("mantel-floral");

// Non-cached methods (for admin)
const result = await repository.findAll({ categoria: "manteles" });
const producto = await repository.findBySlug("mantel-floral");
```

## Creating Custom Cached Queries

Use `createCachedQuery` for custom caching needs:

```typescript
import { createCachedQuery, CACHE_CONFIG } from "@/lib/cache";

async function myQueryInternal(id: string): Promise<MyData> {
  // Your query logic
}

export const myCachedQuery = createCachedQuery<[string], MyData>(
  myQueryInternal,
  CACHE_CONFIG.productos, // or custom config
);
```

## Best Practices

1. **Use cached versions by default** - They provide better performance
2. **Use Fresh versions for admin** - Ensures data is always up-to-date
3. **Revalidate after mutations** - Keep cache fresh after updates
4. **Choose appropriate revalidation times** - Balance freshness vs performance
5. **Use proper cache tags** - Enable targeted invalidation

### Cache Duration Guidelines

- **categorias (24h)**: Most stable data, rarely changes
- **productos_filtrados (2h)**: Category-filtered products, more stable than general listing
- **productos (1h)**: General product listings, moderate update frequency
- **producto_detail (1h)**: Individual products, same update frequency as listings
- **productos_relacionados (1h)**: Related products, aligned with main products

All product-related caches share the `"productos"` tag and can be invalidated immediately using `revalidateProducto(slug)` or `revalidateProductos()`.

## Cache Tags

- `productos`: All product-related data
- `categorias`: Category data

When you call `revalidateTag("productos")`, all caches with that tag are invalidated.

> **Note:** Products relacionados share the `"productos"` tag, so calling `revalidateProductos()` or `revalidateProducto(slug)` will automatically invalidate related products cache.

## Next.js 16 Changes

In Next.js 16, `revalidateTag()` requires a second parameter (profile):

```typescript
revalidateTag("productos", "default"); // Correct
revalidateTag("productos"); // Error in Next.js 16
```

The cache layer handles this automatically.
