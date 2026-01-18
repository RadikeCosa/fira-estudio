# Caching Architecture

## Overview

This document explains how caching is implemented in the Muma Estudio application, with special attention to Next.js 16 compatibility requirements.

## Next.js 16 Compatibility

**Critical Requirement:** Dynamic data sources like `cookies()` cannot be used inside `unstable_cache()` functions.

### The Problem

Prior to this fix, the code structure was:

```typescript
// ❌ BROKEN - cookies() called inside cache
async function getProductosInternal(): Promise<Producto[]> {
  const supabase = await createClient(); // ← calls cookies() internally
  return supabase.from('productos').select('*');
}

export const getProductos = createCachedQuery(
  getProductosInternal,  // Function gets wrapped in unstable_cache()
  CACHE_CONFIG.productos
);
```

This caused the error:
```
Error: Route / used `cookies()` inside a function cached with `unstable_cache()`. 
Accessing Dynamic data sources inside a cache scope is not supported.
```

### The Solution

The fix moves `createClient()` (which calls `cookies()`) outside the cached function:

```typescript
// ✅ FIXED - cookies() called outside cache
async function getProductosInternal(
  supabase: SupabaseClient,  // ← Client passed as parameter
  params?: Params
): Promise<Producto[]> {
  // No createClient() here - uses the passed client
  return supabase.from('productos').select('*');
}

export async function getProductos(params?: Params): Promise<Producto[]> {
  const supabase = await createClient(); // ✅ cookies() called OUTSIDE cache
  
  const cachedFn = createCachedQuery<[SupabaseClient, Params?], Producto[]>(
    getProductosInternal,
    CACHE_CONFIG.productos
  );
  
  return cachedFn(supabase, params); // Client passed to cached function
}
```

## Architecture Components

### 1. Repository Layer (`lib/repositories/`)

Repositories now accept an optional Supabase client in their constructor:

```typescript
export class ProductoRepository extends BaseRepository<ProductoCompleto> {
  private supabase: SupabaseClient | null;

  constructor(supabase?: SupabaseClient) {
    super();
    this.supabase = supabase ?? null;
  }

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) return this.supabase;
    return await createClient();
  }

  async findAll(filter?: Filter): Promise<Result> {
    const supabase = await this.getClient(); // Uses injected or creates new
    // ... query logic
  }
}
```

**Benefits:**
- Cached queries can inject the client created outside cache
- Non-cached queries can still call the repository without passing a client
- Backwards compatible with existing code

### 2. Query Layer (`lib/supabase/queries.ts`)

All queries follow this pattern:

```typescript
// Internal function - accepts client as first parameter
async function getDataInternal(
  supabase: SupabaseClient,
  ...otherParams
): Promise<Data> {
  // Use supabase client for queries
  // Never calls createClient() internally
}

// Public cached function - creates client outside cache
export async function getData(...params): Promise<Data> {
  const supabase = await createClient(); // ✅ Outside cache
  
  const cachedFn = createCachedQuery<[SupabaseClient, ...], Data>(
    getDataInternal,
    CACHE_CONFIG.entity
  );
  
  return cachedFn(supabase, ...params);
}

// Public non-cached function - for admin/fresh data
export async function getDataFresh(...params): Promise<Data> {
  const supabase = await createClient();
  return getDataInternal(supabase, ...params);
}
```

### 3. Cache Layer (`lib/cache/index.ts`)

The cache layer wraps functions with both React cache and Next.js unstable_cache:

```typescript
export function createCachedQuery<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: CacheOptions,
): (...args: TArgs) => Promise<TResult> {
  // Skip caching in development
  if (process.env.NODE_ENV === "development") {
    return fn;
  }

  // Layer 1: React cache (request-level deduplication)
  const reactCached = cache(fn);
  
  // Layer 2: unstable_cache (cross-request persistence)
  return (...args: TArgs) => {
    const cacheKey = JSON.stringify(args);
    const nextCached = unstable_cache(
      async () => reactCached(...args),
      [cacheKey],
      { revalidate: config.revalidate, tags: config.tags }
    );
    return nextCached();
  };
}
```

**Note:** The Supabase client is part of `args` and gets serialized in the cache key. This is acceptable because:
1. The client contains auth state (cookies) that should affect caching
2. The client itself isn't cached - only the query results are cached
3. Each unique auth state gets its own cache entry

## Cache Configuration

```typescript
export const CACHE_CONFIG = {
  productos: {
    revalidate: 3600,      // 1 hour
    tags: ["productos"],
  },
  categorias: {
    revalidate: 86400,     // 24 hours
    tags: ["categorias"],
  },
  producto_detail: {
    revalidate: 1800,      // 30 minutes
    tags: ["productos"],
  },
};
```

## Usage Examples

### In Server Components

```typescript
// app/productos/page.tsx
import { getProductos, getCategorias } from "@/lib/supabase/queries";

export default async function ProductosPage() {
  const productos = await getProductos({ page: 1 });
  const categorias = await getCategorias();
  
  return <ProductGrid productos={productos} />;
}
```

### For Fresh Data (Admin)

```typescript
// For data that should bypass cache
import { getProductosFresh } from "@/lib/supabase/queries";

const freshData = await getProductosFresh({ page: 1 });
```

### Direct Repository Usage

```typescript
// When you already have a Supabase client
const supabase = await createClient();
const repo = new ProductoRepository(supabase);
const result = await repo.findAll({ limit: 10 });

// Or without a client (it creates one internally)
const repo = new ProductoRepository();
const result = await repo.findAll({ limit: 10 });
```

## Testing

The architecture is tested at multiple levels:

1. **Unit tests** verify repository logic
2. **Integration tests** verify query functions work correctly
3. **Build** verifies no cookies() errors occur

## Development vs Production

- **Development:** Caching is disabled (returns unwrapped function)
- **Production:** Full caching with React cache + unstable_cache

This ensures fast feedback during development while maintaining performance in production.

## Migration Notes

If you need to add a new cached query:

1. Create internal function accepting `SupabaseClient` as first parameter
2. Create public function that:
   - Calls `await createClient()` first
   - Creates cached function with `createCachedQuery()`
   - Passes client and other args to cached function
3. Optionally create "Fresh" variant for admin/non-cached needs

**Example:**

```typescript
// 1. Internal function
async function getNewDataInternal(
  supabase: SupabaseClient,
  filter?: Filter
): Promise<Data[]> {
  const { data } = await supabase.from('table').select('*');
  return data ?? [];
}

// 2. Public cached function
export async function getNewData(filter?: Filter): Promise<Data[]> {
  const supabase = await createClient();
  const cachedFn = createCachedQuery<[SupabaseClient, Filter?], Data[]>(
    getNewDataInternal,
    CACHE_CONFIG.entity
  );
  return cachedFn(supabase, filter);
}

// 3. Fresh variant (optional)
export async function getNewDataFresh(filter?: Filter): Promise<Data[]> {
  const supabase = await createClient();
  return getNewDataInternal(supabase, filter);
}
```

## References

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [React cache()](https://react.dev/reference/react/cache)
- [unstable_cache()](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
