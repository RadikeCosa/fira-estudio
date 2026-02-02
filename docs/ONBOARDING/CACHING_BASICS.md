# 🚀 Caching 101 - Para Nuevos Desarrolladores

Bienvenido. Este documento explica **qué es caching** sin asumir experiencia previa.

---

## ¿Qué es Cache?

Imagina que cada vez que visitas un sitio web, el servidor tiene que buscar la información de la base de datos. Si 1000 usuarios visitan la página de productos al mismo tiempo, el servidor consulta la base de datos 1000 veces.

**Cache** es como tomar una "foto" de los datos y guardarla en memoria. Cuando alguien pide los datos, le muestras la "foto" en lugar de consultar la base de datos nuevamente.

```
Sin Cache:
User 1 → Database (slow) ✗ 500ms
User 2 → Database (slow) ✗ 500ms
User 3 → Database (slow) ✗ 500ms

Con Cache:
User 1 → Database (slow) → Save in memory
User 2 → Memory (fast) ✓ 10ms
User 3 → Memory (fast) ✓ 10ms
```

---

## Tipos de Cache en Next.js

### 1. Request Cache (React Cache)

**Duración:** Solo durante UNA solicitud del usuario  
**Propósito:** Evitar llamadas repetidas a la base de datos en la misma página

```typescript
// app/productos/page.tsx
import { getProductos } from "@/lib/supabase/queries";

export default async function ProductosPage() {
  // Primera llamada - va a la base de datos
  const productos = await getProductos();

  // Segunda llamada - devuelve cache (same request)
  const productosAgain = await getProductos();  // ✓ No va a DB

  return <div>{/* ... */}</div>;
}
```

### 2. Full Route Cache (Next.js Cache)

**Duración:** Entre solicitudes (minutos, horas, días)  
**Propósito:** Reutilizar HTML generado para múltiples usuarios

```typescript
// Si tu página NO tiene datos dinámicos, Next.js la cachea automáticamente
export default function StaticPage() {
  return <h1>Esta página es estática</h1>;
}

// Si SÍ tiene datos dinámicos, configura revalidation
import { getProductos } from "@/lib/supabase/queries";

export const revalidate = 3600;  // Regenera página cada hora

export default async function ProductosPage() {
  const productos = await getProductos();
  return <div>{/* ... */}</div>;
}
```

---

## Cache en Fira Estudio

Usamos **React Cache** + **unstable_cache** de Next.js:

```typescript
// lib/supabase/queries.ts// PASO 1: Función interna que hace la consulta
async function getProductosInternal(supabase: SupabaseClient) {
  return supabase.from("productos").select("*").order("nombre");
}

// PASO 2: Función pública que aplica cache
export async function getProductos() {
  const supabase = await createClient(); // ← IMPORTANTE: Fuera del cache

  const cachedFn = createCachedQuery(getProductosInternal, {
    revalidate: 3600, // Cachea 1 hora
    tags: ["productos"], // Etiqueta para invalidación
  });

  return cachedFn(supabase);
}

// PASO 3: Función "Fresh" para cuando necesitas datos nuevos
export async function getProductosFresh() {
  const supabase = await createClient();
  return getProductosInternal(supabase); // Sin cache
}
```

**¿Por qué tres pasos?** Porque `cookies()` (autenticación) no puede estar dentro de `cache()` en Next.js 16.

---

## Cuándo Usar Cache vs Fresh

### ✅ Usa CACHE para:

- Catálogos de productos (cambian poco)
- Categorías
- Configuración general
- Datos públicos

```typescript
// ✓ CORRECTO
export async function getCategories() {
  // getCategories es cacheado
}
```

### ✅ Usa FRESH para:

- Stock en tiempo real
- Datos del usuario (email, perfil)
- Carrito
- Información sensible

```typescript
// ✓ CORRECTO
export async function getUserProfile(userId: string) {
  // Sin cache - siempre datos frescos
}
```

---

## Invalidar Cache

Cuando cambias datos en la base de datos, necesitas limpiar el cache para que otros usuarios vean los cambios.

### Opción 1: Esperar a que expire

```typescript
export const getProductos = createCachedQuery(getProductosInternal, {
  revalidate: 3600, // Espera 1 hora a que se limpie solo
});
```

Después de 1 hora, automáticamente obtiene datos frescos.

### Opción 2: Invalidar manualmente

```typescript
"use server"; // Server Action

import { revalidateTag } from "next/cache";

export async function updateProducto(id: string, data: ProductoUpdate) {
  const supabase = await createClient();
  await supabase.from("productos").update(data).eq("id", id);

  // Limpia el cache inmediatamente
  revalidateTag("productos"); // ← "productos" es la etiqueta
}
```

---

## Problema Común: "cookies() inside cache()"

### ❌ INCORRECTO

```typescript
export const getProductos = createCachedQuery(
  async () => {
    const supabase = await createClient(); // ✗ calls cookies()!
    return supabase.from("productos").select("*");
  },
  { revalidate: 3600 },
);

// Error: Route used `cookies()` inside a function cached with `unstable_cache()`
```

**¿Por qué?** `createClient()` internamente llama a `cookies()` para autenticación. Eso no puede estar dentro de `cache()`.

### ✅ CORRECTO

```typescript
// Paso 1: Función interna SIN createClient()
async function getProductosInternal(supabase: SupabaseClient) {
  return supabase.from("productos").select("*");
}

// Paso 2: Función pública que hace createClient() AFUERA
export async function getProductos() {
  const supabase = await createClient(); // ← FUERA del cache

  const cachedFn = createCachedQuery(getProductosInternal, {
    revalidate: 3600,
  });

  return cachedFn(supabase);
}
```

**Regla:** `createClient()` siempre AFUERA de `createCachedQuery()`.

---

## Checklist para Nuevos Queries

Si necesitas crear un nuevo query, sigue este checklist:

- [ ] Crear función interna `getXXXInternal(supabase, ...params)`
- [ ] Crear función pública `getXXX(...params)` que:
  - [ ] Llama `const supabase = await createClient()` PRIMERO
  - [ ] Crea `cachedFn` con `createCachedQuery()`
  - [ ] Retorna `cachedFn(supabase, ...params)`
- [ ] Agregar `revalidate` time (ej: 3600 para 1 hora)
- [ ] Agregar `tags` para invalidación (ej: ["productos"])
- [ ] (Opcional) Crear variante `getXXXFresh()` sin cache
- [ ] Documentar en archivo

---

## Debugging: ¿Mi cache está funcionando?

### Prueba 1: Ver logs

```typescript
export async function getProductos() {
  console.log("🔄 Fetching productos..."); // ← Deberías verlo solo UNA VEZ

  const supabase = await createClient();
  const cachedFn = createCachedQuery(getProductosInternal, {
    revalidate: 3600,
  });

  return cachedFn(supabase);
}

// Si visitaste /productos 3 veces y ves el log 3 veces → NO cachea
// Si ves el log 1 sola vez → ✓ Cachea correctamente
```

### Prueba 2: Verificar en dev

```typescript
// lib/cache/index.ts
export function createCachedQuery<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: CacheOptions,
): (...args: TArgs) => Promise<TResult> {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Dev mode - caching disabled for ${fn.name}`);
    return fn; // ← En dev, caching está DESHABILITADO
  }

  // ... caching logic
}
```

**Importante:** Cache no funciona en `npm run dev`. Solo funciona en `npm run build && npm run start` (production).

---

## Performance Impact

### Sin Cache

```
100 usuarios → 100 consultas a BD
1 consulta = 200ms
Total = 200ms * 100 = 20 segundos ✗ Muy lento
```

### Con Cache (1 hora)

```
Primer usuario → 1 consulta a BD (200ms)
99 usuarios restantes → Cache (10ms cada uno)

Total = 200ms + (10ms * 99) = 1.19 segundos ✓ Mucho más rápido
```

**Resultado:** ~17x más rápido con cache.

---

## ¿Cuándo NO cachear?

1. **Datos del usuario** - Cada usuario ve datos diferentes
2. **Información en tiempo real** - Stock, precios que cambian
3. **Datos sensibles** - Información privada/confidencial

```typescript
// ✗ NO cachear
export async function getUserCart(userId: string) {
  const supabase = await createClient();
  return supabase.from("carrito").select("*").eq("user_id", userId);
  // Cada usuario debe ver SU carrito, no el de otro
}

// ✓ SÍ cachear
export async function getCategories() {
  const supabase = await createClient();
  return supabase.from("categorias").select("*");
  // Mismo para todos, cacheable
}
```

---

## Resumen

| Concepto         | Qué es                               | Duración     | Usar cuando                      |
| ---------------- | ------------------------------------ | ------------ | -------------------------------- |
| Request Cache    | Evita re-queries en una solicitud    | 1 request    | Datos compartidos en página      |
| Full Route Cache | Guarda HTML renderizado              | Horas/días   | Página estática o semi-estática  |
| revalidate       | Regenera cache después de X segundos | Configurable | Datos que cambian ocasionalmente |
| revalidateTag    | Limpia cache manualmente             | Inmediato    | Datos acaban de cambiar          |

---

## 📚 Próximos Pasos

1. Abre `lib/supabase/queries.ts` y mira cómo se implementa
2. Lee `docs/CACHING_ARCHITECTURE.md` para detalles técnicos
3. Si necesitas crear un nuevo query, copia el patrón de uno existente

---

**Hecho por:** Fira Estudio Dev Team  
**Última actualización:** 29/01/2026
