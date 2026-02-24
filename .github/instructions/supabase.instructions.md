---
applyTo: "lib/supabase/**,lib/repositories/**,lib/cache/**"
---

# Supabase — Patrones de queries

## Cliente correcto según contexto

```ts
import { createClient } from "@/lib/supabase/server"; // Server Components, Server Actions
import { createClient } from "@/lib/supabase/client"; // Client Components
```

## Manejo de errores (siempre)

```ts
const { data, error } = await supabase.from("productos").select("*").eq("slug", slug).single();

if (error) {
  if (error.code === "PGRST116") return notFound(); // Not found
  console.error("Database error:", error);
  throw error;
}
```

## Reglas críticas

- Filtrar activos con `.eq("activo", true)` — nunca `.eq("disponible", true)`
- Usar `.single()` cuando se espera un registro; retorna error si no existe
- **No ordenar relaciones anidadas en la query** — Supabase no lo soporta; sortear en JS

```ts
// ❌ No funciona
supabase.from("productos").select("*, variaciones(*)").order("variaciones(precio)");

// ✅ Sortear después del fetch
data?.forEach(p => {
  p.variaciones.sort((a, b) => a.precio - b.precio);
  p.imagenes.sort((a, b) => (a.es_principal ? -1 : b.es_principal ? 1 : a.orden - b.orden));
});
```

## Cache strategy

| Función | Cache | Usar cuando |
|---|---|---|
| `getProductos()` | 1 hora | Páginas públicas de listado |
| `getProductos({ categoriaSlug })` | 2 horas | Páginas por categoría |
| `getProductoBySlug()` | 1 hora | Página de detalle |
| `getCategorias()` | 24 horas | Nav, filtros |
| `getProductosFresh()` / `*Fresh()` | Sin cache | Admin, post-mutación, debug |

## Invalidación de cache

```ts
import { revalidateProductos, revalidateProducto } from "@/lib/cache/revalidate";

// Después de mutaciones
revalidateProducto(producto.slug);
revalidateProductos();
```

## RLS

- Asumir RLS habilitado en todas las tablas
- Nunca bypasear RLS desde Client Components