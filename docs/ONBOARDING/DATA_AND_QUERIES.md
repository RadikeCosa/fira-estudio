# 📊 Datos y Consultas - Para Nuevos Desarrolladores

Bienvenido. Este documento explica cómo obtener datos de la base de datos sin asumir que sabes qué es una base de datos.

---

## ¿Qué es Supabase? (La Cocina de Datos)

Imagina que toda la información de tu tienda (productos, precios, imágenes, clientes) está guardada en **una mesa gigante en la nube**.

**Supabase** es un servicio que te permite:

1. **Guardar datos** en esa mesa
2. **Buscar datos** en esa mesa
3. **Cambiar datos** en esa mesa
4. **Borrar datos** de esa mesa

```
Tu Aplicación (Next.js)
        ↓
   Tu Código
        ↓
   Supabase (en la nube)
        ↓
   Base de Datos (PostgreSQL)
        ↓
   DATOS ✓
```

**Analoga:** Si tu tienda fuera un restaurante:

- **Supabase** = El gerente del restaurante
- **La Base de Datos** = El almacén de comida
- **Tu Aplicación** = El mesero que pide cosas al gerente

---

## Conceptos Clave

### Las Tablas

Fira Estudio usa 5 tablas principales:

| Tabla                 | Qué Contiene                          | Ejemplo                            |
| --------------------- | ------------------------------------- | ---------------------------------- |
| **categorias**        | Tipos de productos                    | Manteles, Servilletas, Caminos     |
| **productos**         | Productos base                        | "Mantel Floral", "Servilleta Lisa" |
| **variaciones**       | Tamaños, colores, precios específicos | Mantel Floral 150x200 Rojo $15,000 |
| **imagenes_producto** | Fotos                                 | Fotos del Mantel Floral            |
| **consultas**         | Preguntas de clientes                 | "¿Tienen en stock?"                |

**Relación (cómo se conectan):**

```
categorias
    ↑
    │ 1 categoría
    │
productos
    ├── 1 producto
    │       ↓ (muchas variaciones)
    │   variaciones (Mantel 150x200 Rojo, Mantel 150x200 Azul, etc.)
    │
    ├── 1 producto
    │       ↓ (muchas imágenes)
    │   imagenes_producto
    │
    └── ...
```

---

## Tipos TypeScript (Qué es qué)

Antes de hacer una consulta, necesitas entender qué datos obtendrás.

```typescript
// lib/types.ts

/** Una categoría (grupo de productos) */
export interface Categoria {
  id: string; // ID único
  nombre: string; // "Manteles"
  slug: string; // URL-friendly: "manteles"
  descripcion: string; // Descripción larga
  orden: number; // Posición en el menu
}

/** Un producto base */
export interface Producto {
  id: string; // ID único
  nombre: string; // "Mantel Floral"
  slug: string; // "mantel-floral"
  descripcion: string; // Descripción del producto
  categoria_id: string; // ID de su categoría
  precio_desde: number; // Precio mínimo (ej: $15,000)
  destacado: boolean; // ¿Es un producto star? true/false
  activo: boolean; // ¿Está visible? true/false
  tiempo_fabricacion: string; // "3-5 días"
  material: string; // "Algodón"
  cuidados: string; // "Lavar a mano"
}

/** Una variación (tamaño + color + precio específico) */
export interface Variacion {
  id: string; // ID único
  producto_id: string; // A qué producto pertenece
  tamanio: string; // "150x200cm"
  color: string; // "Rojo"
  precio: number; // 15000 (en pesos argentinos)
  stock: number; // 5 unidades disponibles
  sku: string; // "MAN-FL-150-R" (código)
  activo: boolean; // ¿Está disponible? true/false
}

/** Una imagen */
export interface ImagenProducto {
  id: string; // ID único
  producto_id: string; // A qué producto pertenece
  url: string; // URL de la imagen
  alt_text: string; // Texto alternativo para accesibilidad
  orden: number; // Posición (1, 2, 3...)
  es_principal: boolean; // ¿Es la foto de portada?
}

/** Un producto CON todas sus relaciones cargadas */
export type ProductoCompleto = Producto & {
  categoria: Categoria | null; // Su categoría
  variaciones: Variacion[]; // Sus tamaños/colores/precios
  imagenes: ImagenProducto[]; // Sus fotos
};
```

**En español:**

```typescript
// Un producto completo se ve así:
{
  id: "1",
  nombre: "Mantel Floral",
  descripcion: "Hermoso mantel con diseño floral",
  categoria: {
    id: "cat-1",
    nombre: "Manteles"
  },
  variaciones: [
    { tamanio: "150x200", color: "Rojo", precio: 15000, stock: 5 },
    { tamanio: "150x200", color: "Azul", precio: 15000, stock: 3 },
    { tamanio: "180x250", color: "Rojo", precio: 18500, stock: 2 }
  ],
  imagenes: [
    { url: "https://...", alt_text: "Vista frontal" },
    { url: "https://...", alt_text: "Detalle" }
  ]
}
```

---

## El Patrón de Consultas (3 Capas)

En Fira Estudio, obtener datos sigue un patrón de **3 capas**:

```
┌──────────────────────────────────┐
│ 1. INTERNA (getProductosInternal)│
│    - Hace la consulta pura       │
│    - Sin cache                   │
│    - La más lenta                │
└──────────────────┬───────────────┘
                   │ wrapeada con cache
                   ▼
┌──────────────────────────────────┐
│ 2. PÚBLICA (getProductos)        │
│    - Usa cache                   │
│    - Revalida cada 1 hora        │
│    - RÁPIDA ✓ (casos típicos)    │
└──────────────────┬───────────────┘
                   │ bypass cache
                   ▼
┌──────────────────────────────────┐
│ 3. FRESH (getProductosFresh)    │
│    - SIN cache                   │
│    - Siempre datos frescos       │
│    - Para casos especiales       │
└──────────────────────────────────┘
```

---

### Capa 1: Función Interna

```typescript
// lib/supabase/queries.ts

// CAPA 1: Interna (sin cache)
async function getProductosInternal(
  supabase: SupabaseClient,
): Promise<ProductoCompleto[]> {
  // Consulta pura: obtén productos activos con sus relaciones
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `,
    )
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch productos");
  }

  return data || [];
}
```

**¿Qué significa cada línea?**

```typescript
.from("productos")                          // Tabla: productos
.select(`...`)                              // Campos a obtener
.eq("activo", true)                         // Filtro: activo = true
.order("destacado", { ascending: false })   // Ordena: destacados primero
.order("nombre", { ascending: true })       // Luego por nombre A→Z
```

---

### Capa 2: Función Pública con Cache

```typescript
// CAPA 2: Pública (con cache)
export async function getProductos(): Promise<ProductoCompleto[]> {
  // ⚠️ IMPORTANTE: Crea cliente AFUERA del cache
  const supabase = await createClient();

  // Aplica cache a la función interna
  const cachedFn = createCachedQuery(getProductosInternal, {
    revalidate: 3600, // Cachea 1 hora
    tags: ["productos"], // Etiqueta para invalidar después
  });

  // Ejecuta con cache
  return cachedFn(supabase);
}
```

**¿Por qué cache?**

```
Sin cache:
┌─────────────┐
│ User 1      │──→ Consulta a BD (500ms)
└─────────────┘
┌─────────────┐
│ User 2      │──→ Consulta a BD (500ms)
└─────────────┘
┌─────────────┐
│ User 3      │──→ Consulta a BD (500ms)
└─────────────┘
TOTAL: 1500ms ✗

Con cache:
┌─────────────┐
│ User 1      │──→ Consulta a BD (500ms) ──→ Guardar en cache
└─────────────┘
┌─────────────┐
│ User 2      │──→ Obtener del cache (10ms)
└─────────────┘
┌─────────────┐
│ User 3      │──→ Obtener del cache (10ms)
└─────────────┘
TOTAL: 520ms ✓
```

---

### Capa 3: Función Fresh (Sin Cache)

```typescript
// CAPA 3: Fresh (sin cache - datos nuevos siempre)
export async function getProductosFresh(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
  // Sin cache, consulta directa
  return getProductosInternal(supabase);
}
```

**¿Cuándo usarla?**

- Después de crear un producto nuevo
- Después de cambiar precios
- En páginas que SIEMPRE deben mostrar datos frescos

---

## Patrón del Repositorio (Encapsulación)

Para queries más complejas, usamos un **Repositorio** que encapsula toda la lógica:

```typescript
// lib/repositories/producto.repository.ts
export class ProductoRepository extends BaseRepository<ProductoCompleto> {
  // Buscar todos con filtros opcionales
  async findAll(filter?: ProductoFilter) {
    const supabase = await this.getClient();

    let query = supabase
      .from("productos")
      .select("*, categoria(*), variaciones(*), imagenes(*)")
      .eq("activo", true);

    // Filtro por categoría (si viene)
    if (filter?.categoria) {
      query = query.eq("categoria_id", filter.categoria);
    }

    // Paginar
    if (filter?.limit) {
      const offset = filter?.offset || 0;
      query = query.range(offset, offset + filter.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // Buscar uno por ID
  async findById(id: string) {
    const supabase = await this.getClient();

    const { data, error } = await supabase
      .from("productos")
      .select("*, categoria(*), variaciones(*), imagenes(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }
}
```

**Ventajas del Repositorio:**

1. ✅ Lógica centralizada
2. ✅ Fácil de testear
3. ✅ Reutilizable en múltiples queries
4. ✅ Cambios en un lugar

---

## Cómo Usar en Páginas

### Opción A: Query Simple

```typescript
// app/productos/page.tsx
import { getProductos } from "@/lib/supabase/queries";

export default async function ProductosPage() {
  // Llama la función con cache
  const productos = await getProductos();

  return (
    <main>
      {productos.map(p => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </main>
  );
}
```

---

### Opción B: Con Repositorio y Filtros

```typescript
// app/productos/page.tsx
import { ProductoRepository } from "@/lib/repositories/producto.repository";

interface ProductosPageProps {
  searchParams: Promise<{ categoria?: string; page?: string }>;
}

export default async function ProductosPage(props: ProductosPageProps) {
  const searchParams = await props.searchParams;
  const categoria = searchParams.categoria;
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  // Usa el repositorio
  const repo = new ProductoRepository();
  const result = await repo.findAll({
    categoria,
    limit,
    offset,
  });

  return (
    <main>
      <h1>Productos</h1>
      {result.items.map(p => (
        <ProductCard key={p.id} producto={p} />
      ))}

      {/* Paginación */}
      <Pagination
        current={page}
        total={Math.ceil(result.total / limit)}
      />
    </main>
  );
}
```

---

### Opción C: Un Producto por Slug

```typescript
// app/productos/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProductoBySlug } from "@/lib/supabase/queries";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const producto = await getProductoBySlug(params.slug);

  // Si no existe, mostrar página 404
  if (!producto) {
    notFound();
  }

  return (
    <main>
      <ProductGallery imagenes={producto.imagenes} />
      <ProductInfo producto={producto} />
      <VariationSelector variaciones={producto.variaciones} />
    </main>
  );
}
```

---

## Cómo Crear una Nueva Consulta (Paso a Paso)

### Paso 1: Entender Qué Necesitas

```
Necesito: "Obtener los 5 productos más vendidos"
```

---

### Paso 2: Escribir la Función Interna

```typescript
// lib/supabase/queries.ts

// PASO 1: Función interna
async function getProductosMasVendidosInternal(
  supabase: SupabaseClient,
): Promise<ProductoCompleto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categoria(*), variaciones(*), imagenes(*)")
    .eq("activo", true)
    .eq("mas_vendido", true) // Filtro: son más vendidos
    .order("nombre", { ascending: true })
    .limit(5); // Límite: máximo 5

  if (error) throw error;
  return data || [];
}
```

---

### Paso 3: Envolver con Cache

```typescript
// PASO 2: Función pública con cache
export async function getProductosMasVendidos(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();

  const cachedFn = createCachedQuery(getProductosMasVendidosInternal, {
    revalidate: 3600, // Cachea 1 hora
    tags: ["productos"], // Etiqueta para invalidación
  });

  return cachedFn(supabase);
}
```

---

### Paso 4: Exportar

```typescript
// Ahora puedes usar en cualquier página:
import { getProductosMasVendidos } from "@/lib/supabase/queries";

export default async function HomePage() {
  const masVendidos = await getProductosMasVendidos();
  return <FeaturedProducts productos={masVendidos} />;
}
```

---

## Manejo de Errores (Qué Hacer Cuando Falla)

### En Componentes del Servidor

```typescript
// ✅ CORRECTO
export default async function Page() {
  try {
    const productos = await getProductos();
    return <ProductList productos={productos} />;
  } catch (error) {
    // next/navigation exporta notFound() y redirect()
    if (error instanceof NotFoundError) {
      notFound();
    }

    // Errores de base de datos disparan el error.tsx más cercano
    throw error;
  }
}
```

---

### En Componentes del Cliente

```typescript
// ✅ CORRECTO
'use client';

import { useState, useEffect } from 'react';

export function ProductList() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/productos');

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return <div>{/* Mostrar productos */}</div>;
}
```

---

### Errores Comunes de Base de Datos

| Error              | Causa                  | Solución                                 |
| ------------------ | ---------------------- | ---------------------------------------- |
| `PGRST116`         | Registro no encontrado | Usa `notFound()`                         |
| `42P01`            | Tabla no existe        | Verifica que la tabla existe en Supabase |
| `42703`            | Columna no existe      | Revisa el nombre de la columna           |
| `UNIQUE violation` | Valor duplicado        | Valida antes de insertar                 |
| Timeout            | Consulta muy lenta     | Agrega índices o pagina los resultados   |

---

## Rate Limiting (Control de Velocidad)

Para evitar que usuarios hagan demasiadas consultas rápido, usamos `localStorage`:

```typescript
// hooks/useRateLimit.ts
"use client";

export function useRateLimit(key: string, limit: number, window: number) {
  const canFetch = () => {
    const stored = localStorage.getItem(key);
    const now = Date.now();

    if (!stored) {
      localStorage.setItem(key, JSON.stringify([now]));
      return true;
    }

    const timestamps = JSON.parse(stored) as number[];
    const recent = timestamps.filter((t) => now - t < window);

    if (recent.length < limit) {
      recent.push(now);
      localStorage.setItem(key, JSON.stringify(recent));
      return true;
    }

    return false; // Demasiadas solicitudes
  };

  return { canFetch };
}
```

**Uso:**

```typescript
'use client';

import { useRateLimit } from '@/hooks/useRateLimit';

export function ContactForm() {
  const { canFetch } = useRateLimit('contact-form', 5, 60000); // 5 por minuto

  const handleSubmit = async (e) => {
    if (!canFetch()) {
      alert('Espera un poco antes de enviar otro mensaje');
      return;
    }

    // Enviar formulario
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## Patrones Avanzados

### Buscar con Múltiples Filtros

```typescript
// lib/supabase/queries.ts

interface ProductosFilter {
  categoria?: string;
  destacado?: boolean;
  precioMin?: number;
  precioMax?: number;
  limit?: number;
  offset?: number;
}

async function getProductosInternal(
  supabase: SupabaseClient,
  filter?: ProductosFilter,
): Promise<{ items: ProductoCompleto[]; total: number }> {
  let query = supabase
    .from("productos")
    .select(
      `
        *,
        categoria(*),
        variaciones(*),
        imagenes(*)
      `,
      { count: "exact" },
    )
    .eq("activo", true);

  // Aplicar filtros
  if (filter?.categoria) {
    // Buscar por slug de categoría
    const { data: cat } = await supabase
      .from("categorias")
      .select("id")
      .eq("slug", filter.categoria)
      .single();

    if (cat) {
      query = query.eq("categoria_id", cat.id);
    }
  }

  if (filter?.destacado !== undefined) {
    query = query.eq("destacado", filter.destacado);
  }

  // Para rango de precio, necesitamos filtrar en JavaScript
  // porque no podemos ordenar por variaciones directamente
  let { data, error, count } = await query;

  if (error) throw error;

  // Filtrar por precio en JavaScript
  if (filter?.precioMin || filter?.precioMax) {
    data = data?.filter((p) => {
      const precios = p.variaciones.map((v) => v.precio);
      const min = Math.min(...precios);

      if (filter.precioMin && min < filter.precioMin) return false;
      if (filter.precioMax && min > filter.precioMax) return false;

      return true;
    });
  }

  // Paginar
  if (filter?.limit) {
    const offset = filter?.offset || 0;
    data = data?.slice(offset, offset + filter.limit);
  }

  return { items: data || [], total: count || 0 };
}
```

---

### Obtener Datos Relacionados

```typescript
// ✅ Obtener un producto con TODAS sus relaciones

async function getProductoConTodoInternal(
  supabase: SupabaseClient,
  id: string,
): Promise<ProductoCompleto> {
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categoria:categoria_id(
        id,
        nombre,
        slug,
        descripcion
      ),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new NotFoundError(`Producto ${id} no encontrado`);
    }
    throw error;
  }

  return data;
}
```

---

## Errores Comunes

### ❌ Error 1: Olvidar el `await` en async

```typescript
// ❌ INCORRECTO
const productos = getProductos(); // Falta await!

// ✅ CORRECTO
const productos = await getProductos();
```

---

### ❌ Error 2: No manejar null

```typescript
// ❌ INCORRECTO
const producto = await getProductoBySlug("xxx");
return <h1>{producto.nombre}</h1>; // ¿Y si es null?

// ✅ CORRECTO
const producto = await getProductoBySlug("xxx");
if (!producto) notFound();
return <h1>{producto.nombre}</h1>;
```

---

### ❌ Error 3: Hacer queries en componentes del cliente sin API

```typescript
// ❌ INCORRECTO (No tienes acceso a createClient en cliente)
"use client";

import { createClient } from "@/lib/supabase/server";

export default function Page() {
  const supabase = await createClient(); // ✗ ERROR!
}
```

**Solución:**

```typescript
// ✅ CORRECTO (Opción 1: Fetch desde servidor)
export default async function Page() {
  const productos = await getProductos(); // Servidor
  return <ProductList productos={productos} />;
}

// ✅ CORRECTO (Opción 2: Fetch API desde cliente)
'use client';

useEffect(() => {
  fetch('/api/productos')
    .then(r => r.json())
    .then(setProductos);
}, []);
```

---

### ❌ Error 4: No cachear queries costosas

```typescript
// ❌ INCORRECTO (sin cache - lento)
export async function getProductos() {
  const supabase = await createClient();
  return getProductosInternal(supabase); // Sin cache ✗
}

// ✅ CORRECTO (con cache - rápido)
export async function getProductos() {
  const supabase = await createClient();
  const cachedFn = createCachedQuery(getProductosInternal, {
    revalidate: 3600,
    tags: ["productos"],
  });
  return cachedFn(supabase);
}
```

---

## Flujo Completo: Ejemplo Real

**Necesidad:** "Mostrar 8 productos destacados en la página de inicio"

### 1. Crear la Consulta (lib/supabase/queries.ts)

```typescript
// Capa interna
async function getProductosDestacadosInternal(
  supabase: SupabaseClient,
): Promise<ProductoCompleto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categoria(*), variaciones(*), imagenes(*)")
    .eq("activo", true)
    .eq("destacado", true)
    .order("nombre")
    .limit(8);

  if (error) throw error;
  return data || [];
}

// Capa pública con cache
export async function getProductosDestacados(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
  const cachedFn = createCachedQuery(getProductosDestacadosInternal, {
    revalidate: 3600,
    tags: ["productos"],
  });
  return cachedFn(supabase);
}
```

---

### 2. Usar en Página (app/page.tsx)

```typescript
import { getProductosDestacados } from "@/lib/supabase/queries";
import { HOME_CONTENT } from "@/lib/content/home";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

export default async function HomePage() {
  const productos = await getProductosDestacados();

  return (
    <main>
      {/* ... otras secciones ... */}

      <section>
        <h2>{HOME_CONTENT.featured.title}</h2>
        <FeaturedProducts productos={productos} />
      </section>
    </main>
  );
}
```

---

### 3. Componente Reutilizable (components/home/FeaturedProducts.tsx)

```typescript
import { ProductCard } from "@/components/productos/ProductCard";
import type { ProductoCompleto } from "@/lib/types";

interface FeaturedProductsProps {
  productos: ProductoCompleto[];
}

export function FeaturedProducts({ productos }: FeaturedProductsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {productos.length === 0 ? (
        <p>No hay productos destacados</p>
      ) : (
        productos.map(p => <ProductCard key={p.id} producto={p} />)
      )}
    </div>
  );
}
```

---

## Checklist: Entiendo Datos y Consultas

- [ ] Entiendo qué es Supabase (base de datos en la nube)
- [ ] Puedo leer los tipos en `lib/types.ts`
- [ ] Entiendo la estructura de 3 capas (interna, pública, fresh)
- [ ] Sé por qué usamos cache
- [ ] He visto un repositorio y entiendo por qué se usa
- [ ] Sé cómo usar `await` y `async`
- [ ] Sé qué hacer cuando un registro no se encuentra
- [ ] Sé cómo crear una nueva consulta (paso a paso)
- [ ] He entendido un flujo completo (query → página → componente)
- [ ] Entiendo la diferencia entre servidor y cliente para queries

---

## Siguientes Pasos

1. **Abre [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** si no entiendes dónde poner archivos
2. **Abre [../CACHING_ARCHITECTURE.md](../CACHING_ARCHITECTURE.md)** si necesitas detalles profundos de cache
3. **Abre [../error-boundaries.md](../error-boundaries.md)** si necesitas manejar errores
4. **Abre `.github/instructions/copilot-instructions.instructions.md`** para reglas completas
5. **Lee `lib/supabase/queries.ts`** en el proyecto para ver queries reales
6. **Lee `lib/repositories/producto.repository.ts`** para ver el patrón repositorio

**Próximo paso:** Intenta crear tu primera consulta. Comienza simple. 🚀

---

## Referencias Rápidas

**Comandos útiles en desarrollo:**

```bash
# Ver base de datos en tiempo real
# Abre https://app.supabase.com → Tu Proyecto → SQL Editor

# Reiniciar cache durante desarrollo
# En terminal: npm run dev

# Ver errores
# Abre la terminal de Next.js (verás errores en rojo)
```

**Archivos Clave:**

- Tipos: `lib/types.ts`
- Queries: `lib/supabase/queries.ts`
- Repositorio: `lib/repositories/producto.repository.ts`
- Tests: `*.test.tsx` en cualquier carpeta
