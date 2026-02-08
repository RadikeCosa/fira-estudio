# Caching Architecture

## Overview

This document explains how caching is implemented in the fira Estudio application

**Critical Requirement:** Dynamic data sources like `cookies()` cannot be used inside `unstable_cache()` functions.

### The Problem

Prior to this fix, the code structure was:

```typescript
// ❌ BROKEN - cookies() called inside cache
async function getProductosInternal(): Promise<Producto[]> {
  const supabase = await createClient(); // ← calls cookies() internally
  return supabase.from("productos").select("*");
}

export const getProductos = createCachedQuery(
  getProductosInternal, // Function gets wrapped in unstable_cache()
  CACHE_CONFIG.productos,
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
  supabase: SupabaseClient, // ← Client passed as parameter
  params?: Params,
): Promise<Producto[]> {
  // No createClient() here - uses the passed client
  return supabase.from("productos").select("*");
}

export async function getProductos(params?: Params): Promise<Producto[]> {
  const supabase = await createClient(); // ✅ cookies() called OUTSIDE cache

  const cachedFn = createCachedQuery<[SupabaseClient, Params?], Producto[]>(
    getProductosInternal,
    CACHE_CONFIG.productos,
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
      { revalidate: config.revalidate, tags: config.tags },
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
    revalidate: 3600, // 1 hour
    tags: ["productos"],
  },
  categorias: {
    revalidate: 3600, // 1 hour
    tags: ["categorias"],
  },
  producto_detail: {
    revalidate: 3600, // 1 hour
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

---

## 🛠️ Troubleshooting

### Problema 1: "cookies() used in unstable_cache()" error

**Síntoma:**

```
Error: Route /productos used `cookies()` inside a function cached with `unstable_cache()`.
```

**Causa:** `createClient()` se llama DENTRO de una función cached.

**Solución:**

```typescript
// ❌ INCORRECTO
export const getProductos = createCachedQuery(async () => {
  const supabase = await createClient(); // ← cookies() inside cache!
  return supabase.from("productos").select("*");
}, CACHE_CONFIG.productos);

// ✅ CORRECTO
async function getProductosInternal(supabase: SupabaseClient) {
  return supabase.from("productos").select("*");
}

export async function getProductos() {
  const supabase = await createClient(); // ← cookies() OUTSIDE cache
  const cachedFn = createCachedQuery(
    getProductosInternal,
    CACHE_CONFIG.productos,
  );
  return cachedFn(supabase);
}
```

### Problema 2: Cache no se invalida después de cambios

**Síntoma:** Datos antiguos después de actualizar en Supabase

**Causa:** `revalidateTag()` o `revalidatePath()` no está siendo llamado

**Solución:**

```typescript
// En server action que actualiza datos
"use server";

import { revalidateTag } from "next/cache";

export async function updateProducto(id: string, data: ProductoUpdate) {
  const supabase = await createClient();
  await supabase.from("productos").update(data).eq("id", id);

  // Invalidar cache
  revalidateTag("productos"); // Invalidar todos los productos
}
```

### Problema 3: Performance no mejora con cache

**Síntoma:** Páginas siguen lentas incluso con cache configurado

**Causa:** Query no está siendo cached (función no se ejecuta en server)

**Validación:**

```typescript
// Verificar que la función está siendo cacheada
console.log(process.env.NODE_ENV); // Debe ser 'production'

// En app/layout.tsx o page.tsx (Server Component)
const data = await getProductos(); // ✓ Cacheado

// En client component
("use client");
useEffect(() => {
  const data = getProductos(); // ✗ No cacheado (client side)
}, []);
```

---

## 🎯 Best Practices

### ✅ DO: Usar Tags para invalidación

```typescript
// lib/supabase/queries.ts
export const CACHE_CONFIG = {
  productos: {
    revalidate: 3600,
    tags: ["productos"], // ← Tag para invalidación
  },
  producto_detail: {
    revalidate: 3600,
    tags: ["productos"], // ← Mismo tag para invalidar juntos
  },
};

// En server action
("use server");
import { revalidateTag } from "next/cache";

export async function deleteProducto(id: string) {
  // ... delete logic
  revalidateTag("productos"); // Invalida ambas queries
}
```

### ✅ DO: Proporcionar "Fresh" variant para admin

```typescript
// lib/supabase/queries.ts

// Cached - para usuarios normales
export async function getProductos() { ... }

// Fresh - para admin/moderators que necesitan datos frescos
export async function getProductosFresh() { ... }

// app/admin/page.tsx
import { getProductosFresh } from "@/lib/supabase/queries";

export default async function AdminPage() {
  const productos = await getProductosFresh();  // Siempre fresh
  return ...
}
```

### ❌ DON'T: Cachear datos sensibles

```typescript
// ❌ INCORRECTO - Usuario data no debe estar cacheado
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const cachedFn = createCachedQuery(
    async (client) => client.from("profiles").select("*").eq("id", userId),
    { revalidate: 3600, tags: ["user-profile"] },
  );
  return cachedFn(supabase); // ✗ Puede mostrar datos de otro usuario
}

// ✅ CORRECTO - Sin cache
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}
```

### ✅ DO: Documentar tiempos de revalidación

```typescript
export const CACHE_CONFIG = {
  // Catálogo estable - cached 1 hora
  productos: {
    revalidate: 3600, // 1 hour
    tags: ["productos"],
  },

  // Stock cambia frecuentemente - cached 5 minutos
  producto_stock: {
    revalidate: 300, // 5 minutes
    tags: ["stock"],
  },

  // Ofertas temporales - cached 30 minutos
  ofertas: {
    revalidate: 1800, // 30 minutes
    tags: ["ofertas"],
  },
};
```

### ❌ DON'T: Usar cache sin considerar TTL

```typescript
// ❌ INCORRECTO - Sin revalidate = cache indefinido
export const getProductos = createCachedQuery(
  getProductosInternal,
  { tags: ["productos"] }, // ✗ Sin revalidate!
);

// ✅ CORRECTO - Siempre especificar TTL
export const getProductos = createCachedQuery(
  getProductosInternal,
  { revalidate: 3600, tags: ["productos"] }, // ✓ 1 hour
);
```

---

## 🔄 Cache Invalidation Patterns

### Pattern 1: Invalidar en Server Action

```typescript
"use server";

import { revalidateTag } from "next/cache";

export async function addProducto(data: ProductoCreate) {
  const supabase = await createClient();
  const result = await supabase.from("productos").insert(data);

  // Invalidar cache
  revalidateTag("productos");

  return result;
}
```

### Pattern 2: Invalidar en Route Handler

```typescript
// app/api/productos/route.ts

export async function POST(request: Request) {
  const supabase = await createClient();
  const data = await request.json();

  await supabase.from("productos").insert(data);

  // Invalidar cache
  revalidateTag("productos");

  return Response.json({ success: true });
}
```

### Pattern 3: Invalidar con webhook

```typescript
// app/api/webhooks/supabase/route.ts

export async function POST(request: Request) {
  const event = await request.json();

  if (event.type === "INSERT" || event.type === "UPDATE") {
    if (event.table === "productos") {
      revalidateTag("productos");
    }
  }

  return Response.json({ ok: true });
}
```

---

## 📊 Cache Flow Diagram

```
Client Request
    ↓
Server Component
    ↓
Call getProductos()
    ↓
Check React Cache (request-level)
    ├─ HIT: Return cached data
    └─ MISS: Continue
    ↓
Check unstable_cache (cross-request)
    ├─ HIT: Return cached data
    └─ MISS: Continue
    ↓
Execute query (hit database)
    ↓
Store in unstable_cache (expires after revalidate)
    ↓
Return data to client
    ↓
Cache invalidated by:
├─ Time (revalidate: 3600)
├─ On-demand (revalidateTag)
└─ Path (revalidatePath)
```

---

## 📚 Migration Notes

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
  filter?: Filter,
): Promise<Data[]> {
  const { data } = await supabase.from("table").select("*");
  return data ?? [];
}

// 2. Public cached function
export async function getNewData(filter?: Filter): Promise<Data[]> {
  const supabase = await createClient();
  const cachedFn = createCachedQuery<[SupabaseClient, Filter?], Data[]>(
    getNewDataInternal,
    CACHE_CONFIG.entity,
  );
  return cachedFn(supabase, filter);
}

// 3. Fresh variant (optional)
export async function getNewDataFresh(filter?: Filter): Promise<Data[]> {
  const supabase = await createClient();
  return getNewDataInternal(supabase, filter);
}
```

---

## 🔗 Referencias

- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [React cache()](https://react.dev/reference/react/cache)
- [unstable_cache()](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [revalidateTag()](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [revalidatePath()](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
