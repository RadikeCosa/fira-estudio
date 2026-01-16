---
title: "Skills de GitHub Copilot para Muma Estudio [DEPRECATED]"
description: "Conocimientos técnicos específicos para el desarrollo del e-commerce de textiles"
version: "2.0"
lastUpdated: "2026-01-16"
category: "Technical Knowledge Base"
deprecated: true
replacedBy: ".github/skills/"
tags:
  - copilot
  - skills
  - nextjs
  - supabase
  - typescript
  - e-commerce
---

# ⚠️ DEPRECATED: Skills de GitHub Copilot - Muma Estudio

> **This file has been deprecated as of 2026-01-16 (v3.0)**
> 
> The content has been reorganized into modular skill files for better maintainability and activation accuracy.
> 
> **New structure:**
> - Core instructions: `.github/instructions/copilot-instructions.instructions.md`
> - Supabase queries: `.github/skills/supabase-queries/SKILL.md`
> - WhatsApp integration: `.github/skills/whatsapp-integration/SKILL.md`
> - Product variations: `.github/skills/product-variations/SKILL.md`
> - Database schema: `.github/reference/database-schema.md`
> - Business logic: `.github/reference/business-logic.md`
> 
> This file is kept for historical reference only.

---

# Skills de GitHub Copilot - Muma Estudio

Esta guía contiene conocimientos técnicos específicos que Copilot debe aplicar al trabajar en este proyecto.

---

## 🎯 Dominio del Negocio

### Modelo de Producto Textil

**Conceptos clave:**

- **Producto base:** Representación general (ej: "Mantel Floral")
- **Variación:** Combinación específica de tamaño + color con precio y stock propios
- **Los precios NO son únicos por producto**, cada variación tiene su precio
- **Imágenes:** Pueden ser compartidas entre variaciones o específicas

**Ejemplo de estructura:**

```typescript
Producto:  "Mantel Floral"
├── Variación 1: 150x200cm - Rojo - $15,000 - Stock: 5
├── Variación 2: 150x200cm - Azul - $15,000 - Stock: 3
├── Variación 3: 180x250cm - Rojo - $18,500 - Stock: 2
└── Variación 4: 180x250cm - Azul - $18,500 - Stock: 0 (inactivo)
```

### Flujo de Usuario (V1)

```
Navegación de Catálogo
     ↓
Selección de Producto
     ↓
Vista de Detalle con Variaciones
     ↓
Selección de Tamaño y Color
     ↓
Click en "Consultar por WhatsApp"
     ↓
WhatsApp con mensaje pre-formateado
     ↓
Venta offline (fuera de la plataforma)
```

**NO hay en V1:** Carrito, pagos online, checkout, gestión de pedidos.

---

## 🛠️ Skills Técnicas

### 1. Queries de Supabase con Relaciones

#### Patrón: Producto con todas sus relaciones

```typescript
const { data, error } = await supabase
  .from("productos")
  .select(
    `
    *,
    categoria:categorias(id, nombre, slug),
    variaciones!inner(id, tamanio, color, precio, stock, activo),
    imagenes:imagenes_producto(id, url, alt_text, orden, es_principal)
  `
  )
  .eq("slug", slug)
  .eq("activo", true)
  .single();

if (error) {
  if (error.code === "PGRST116") return null; // No encontrado
  throw error;
}

// ⚠️ CRÍTICO: Ordenar relaciones en JavaScript
if (data) {
  data.variaciones.sort((a, b) => a.precio - b.precio);
  data.imagenes.sort((a, b) => a.orden - b.orden);
}

return data as ProductoCompleto;
```

**Relaciones en el esquema:**

- `productos` → `categorias` (many-to-one)
- `productos` → `variaciones` (one-to-many)
- `productos` → `imagenes_producto` (one-to-many)

#### ⚠️ IMPORTANTE: Limitaciones de Supabase

```typescript
// ❌ NO FUNCIONA en Supabase
. order('variaciones(precio)', { ascending: true })
.order('imagenes(orden)', { ascending: true })

// ✅ SOLUCIÓN: Ordenar en JavaScript después del fetch
data.forEach(producto => {
  producto. variaciones.sort((a, b) => a.precio - b.precio);
  producto.imagenes.sort((a, b) => a.orden - b.orden);
});
```

---

### 2. Tipado de Datos

#### Tipos definidos manualmente (lib/types.ts)

```typescript
import type {
  Producto,
  Variacion,
  ImagenProducto,
  Categoria,
  ProductoCompleto,
} from "@/lib/types";

// Tipo compuesto para queries con joins
type ProductoCompleto = Producto & {
  categoria: Categoria | null;
  variaciones: Variacion[];
  imagenes: ImagenProducto[];
};

// Uso en funciones
export async function getProductoBySlug(
  slug: string
): Promise<ProductoCompleto | null> {
  const supabase = await createClient();
  // Query...
  return data as ProductoCompleto;
}
```

**Nota:** Los tipos están definidos manualmente por ahora. En el futuro se generarán automáticamente con Supabase CLI.

---

### 3. Composición de URLs de WhatsApp

```typescript
import { WHATSAPP } from "@/lib/constants";
import type { Producto, Variacion } from "@/lib/types";

function generarMensajeWhatsApp(
  producto: Producto,
  variacion: Variacion
): string {
  const mensaje = [
    "¡Hola! Me interesa este producto: ",
    "",
    `📦 Producto: ${producto.nombre}`,
    `📏 Tamaño: ${variacion.tamanio}`,
    `🎨 Color: ${variacion.color}`,
    `💰 Precio: $${variacion.precio.toLocaleString("es-AR")}`,
    "",
    "¿Está disponible?",
  ].join("\n");

  return mensaje;
}

// Uso en componente
const whatsappUrl = WHATSAPP.getUrl(
  generarMensajeWhatsApp(producto, variacion)
);

// Resultado: https://wa.me/5492999XXXXXX? text=... mensaje-encoded
```

---

### 4. Optimización de Imágenes con Next.js

```tsx
import Image from 'next/image';

// Imagen principal (LCP - Largest Contentful Paint)
<Image
  src={imagen. url}
  alt={imagen. alt_text || producto.nombre}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover rounded-lg"
  priority={imagen.es_principal}  // ← Solo para imagen principal
/>

// Imágenes secundarias (lazy loading)
<Image
  src={imagen.url}
  alt={imagen.alt_text}
  width={200}
  height={200}
  loading="lazy"  // ← Cargar bajo demanda
  className="object-cover"
/>
```

**Reglas:**

- Usar `priority={true}` **solo** para la imagen principal (LCP)
- Imágenes secundarias con `loading="lazy"`
- Siempre especificar `width` y `height` para evitar CLS (Cumulative Layout Shift)
- `sizes` para responsive images

---

### 5. Manejo de Estados de Carga

#### Patrón con Suspense

```tsx
import { Suspense } from "react";

export default function ProductosPage() {
  return (
    <Suspense fallback={<ProductosSkeleton />}>
      <ProductosContent />
    </Suspense>
  );
}

async function ProductosContent() {
  const productos = await getProductos();
  return <ProductGrid productos={productos} />;
}
```

#### Patrón con loading.tsx (App Router)

```tsx
// app/productos/loading.tsx
export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## 🎨 Skills de UI/UX

### 1. Responsive Design Mobile-First

```tsx
// Pattern: Escalado progresivo de columnas
<div className="
  grid
  grid-cols-1          // Mobile:  1 columna
  sm:grid-cols-2       // Tablet: 2 columnas
  lg:grid-cols-3       // Desktop: 3 columnas
  xl:grid-cols-4       // Large:  4 columnas
  gap-4 sm:gap-6 lg:gap-8
">
```

**Breakpoints de Tailwind:**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

### 2. Diseño de Product Cards

```tsx
<article className="group relative">
  {/* Imagen con hover effect */}
  <div
    className="
    aspect-square
    overflow-hidden
    rounded-lg
    bg-gray-100
  "
  >
    <Image
      src={imagenPrincipal.url}
      alt={producto.nombre}
      className="
        h-full w-full
        object-cover
        transition-transform
        duration-300
        group-hover: scale-105
      "
    />
  </div>

  {/* Información del producto */}
  <div className="mt-4 space-y-2">
    <h3 className="font-medium text-foreground">{producto.nombre}</h3>

    <p className="text-sm text-accent">{producto.categoria?.nombre}</p>

    {/* Precio o rango de precios */}
    {variaciones.length > 1 ? (
      <p className="text-sm font-semibold">
        Desde $
        {Math.min(...variaciones.map((v) => v.precio)).toLocaleString("es-AR")}
      </p>
    ) : (
      <p className="font-semibold">
        ${variaciones[0].precio.toLocaleString("es-AR")}
      </p>
    )}
  </div>
</article>
```

---

### 3. Galería de Imágenes con Thumbnails

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export function ProductGallery({ imagenes }: { imagenes: ImagenProducto[] }) {
  const [imagenActualIndex, setImagenActualIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div
        className="
        aspect-square
        overflow-hidden
        rounded-lg
        border border-border
      "
      >
        <Image
          src={imagenes[imagenActualIndex].url}
          alt={imagenes[imagenActualIndex].alt_text}
          width={800}
          height={800}
          priority
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {imagenes.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {imagenes.map((imagen, index) => (
            <button
              key={imagen.id}
              onClick={() => setImagenActualIndex(index)}
              className={clsx(
                "aspect-square overflow-hidden rounded border-2 transition-all",
                index === imagenActualIndex
                  ? "border-accent ring-2 ring-accent ring-offset-2"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={imagen.url}
                alt={imagen.alt_text}
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Skills de Rendimiento

### 1. Caché de Queries con revalidation

```typescript
// En Server Components - revalidación automática
export const revalidate = 3600; // 1 hora

export default async function ProductosPage() {
  // Esta query se cachea automáticamente
  const productos = await getProductos();
  return <ProductGrid productos={productos} />;
}
```

### 2. Prefetching de Links

```tsx
import Link from "next/link";

// Next.js prefetchea automáticamente links en el viewport
<Link
  href={`/productos/${producto.slug}`}
  prefetch={true} // Prefetch más agresivo
>
  {producto.nombre}
</Link>;
```

### 3. Lazy Loading de Componentes

```tsx
import dynamic from "next/dynamic";

// Cargar componente pesado solo cuando sea necesario
const ProductGallery = dynamic(
  () => import("@/components/productos/ProductGallery"),
  { loading: () => <GallerySkeleton /> }
);
```

---

## 🔐 Skills de Seguridad

### 1. Validación de Inputs con Zod

```typescript
import { z } from "zod";

const consultaSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(100),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "Mensaje muy corto").max(1000),
});

// Uso en Server Action
("use server");

export async function enviarConsulta(formData: FormData) {
  const parsed = consultaSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    mensaje: formData.get("mensaje"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // Guardar en Supabase...
  const supabase = await createClient();
  const { error } = await supabase.from("consultas").insert(parsed.data);

  if (error) throw error;
  return { success: true };
}
```

### 2. Sanitización de Slugs

```typescript
function isValidSlug(slug: string): boolean {
  // Solo letras minúsculas, números y guiones
  return /^[a-z0-9]+(? :-[a-z0-9]+)*$/.test(slug);
}

export async function getProductoBySlug(slug: string) {
  if (!isValidSlug(slug)) {
    throw new Error("Slug inválido");
  }

  const supabase = await createClient();
  // Query...
}
```

---

## 🎓 Skills de Accesibilidad

```tsx
// Semantic HTML
<article aria-labelledby={`producto-${producto.id}`}>
  <h2 id={`producto-${producto.id}`} className="text-xl font-semibold">
    {producto.nombre}
  </h2>
</article>

// Alt text descriptivo
<Image
  src={imagen.url}
  alt={`${producto.nombre} - ${variacion.color}, tamaño ${variacion.tamanio}`}
  width={800}
  height={600}
/>

// Estados de loading accesibles
<button
  disabled={isLoading}
  aria-busy={isLoading}
  className="focus:ring-2 focus:ring-accent focus:ring-offset-2"
>
  {isLoading ? (
    <>
      <span className="sr-only">Cargando...</span>
      <Spinner aria-hidden="true" />
    </>
  ) : (
    'Consultar por WhatsApp'
  )}
</button>

// Focus management
<button className="
  rounded-lg
  focus:outline-none
  focus: ring-2
  focus:ring-accent
  focus:ring-offset-2
">
```

---

## 🗂️ Patterns de Organización

### Separación de Concerns

```
components/
├── layout/          → Estructura general (Header, Footer, MobileNav)
├── productos/       → Dominio de productos (Card, Gallery, Selector)
├── ui/              → Primitivos reutilizables (Button, Input) - futuro
└── forms/           → Formularios (Contact, Newsletter) - futuro

lib/
├── constants/       → Configuración global centralizada
├── supabase/        → Cliente y queries específicas
├── utils/           → Funciones utilitarias
└── types. ts         → Tipos compartidos
```

### Naming Conventions

```typescript
// Queries → get[Resource](s)
getProductos();
getProductoBySlug();
getCategorias();

// Mutations → create/update/delete[Resource]
createConsulta();
updateProducto();
deleteVariacion();

// Utils → verbo descriptivo
formatPrice();
slugify();
truncateText();

// Components → sustantivo descriptivo
ProductCard;
VariationSelector;
WhatsAppButton;
```

---

## 🔑 Patrones Clave (Resumen)

### 1. ✅ Queries: Ordenar en JavaScript, no en Supabase

```typescript
// ✅ CORRECTO
const { data } = await supabase
  . from('productos')
  .select('*, variaciones(*)');

data.forEach(p => {
  p.variaciones.sort((a, b) => a.precio - b.precio);
});

// ❌ INCORRECTO
. order('variaciones(precio)')  // NO funciona
```

### 2. ✅ Usar columna "activo", no "disponible"

```typescript
. eq('activo', true)  // ✅
.eq('disponible', true)  // ❌ No existe
```

### 3. ✅ Tipos manuales por ahora

```typescript
import { Producto, Variacion } from "@/lib/types"; // ✅ Ahora

// 🔮 Futuro (con Supabase CLI)
import { Database } from "@/lib/database.types";
type Producto = Database["public"]["Tables"]["productos"]["Row"];
```

### 4. ✅ Server Component por defecto

```typescript
// ✅ Server Component (defecto) - Sin estado ni eventos
export default async function Page() {
  const data = await getData();
  return <Component data={data} />;
}

// ✅ Client Component - Solo cuando necesites hooks/eventos
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState(null);
  return <button onClick={() => setState(...)}>... </button>;
}
```

---

## 📈 Métricas de Éxito

Copilot debe optimizar para:

- **Performance:** Core Web Vitals

  - LCP (Largest Contentful Paint) < 2.5s
  - CLS (Cumulative Layout Shift) < 0.1
  - FID (First Input Delay) < 100ms

- **SEO:** Metadata correcta, structured data

- **Accesibilidad:** WCAG 2.1 AA compliance

- **Type Safety:** 0 errores de TypeScript, 0 usos de `any`

- **Bundle Size:** Mantener bajo con Server Components

---

## 🔮 V2 - Features Futuras (NO Implementar Aún)

Cuando se trabaje en V2, se agregará:

```typescript
// Carrito de compras con Context API
"use client";
import { createContext, useContext, useState } from "react";

interface CarritoItem {
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number;
}

const CarritoContext = createContext<CarritoItem[]>([]);

// Integración con Mercado Pago
("use server");
import mercadopago from "mercadopago";

export async function crearPreferencia(items: CarritoItem[]) {
  const preference = {
    items: items.map((item) => ({
      title: item.producto_nombre,
      unit_price: item.precio_unitario,
      quantity: item.cantidad,
    })),
    back_urls: {
      success: `${SITE_CONFIG.url}/checkout/success`,
      failure: `${SITE_CONFIG.url}/checkout/failure`,
    },
  };

  const response = await mercadopago.preferences.create(preference);
  return response.body.init_point;
}
```

**🚨 NO generar este código a menos que se solicite explícitamente.**

---

## ✅ Componentes Actuales del Proyecto

**Implementados (V1):**

- ✅ ProductCard, ProductGrid
- ✅ ProductGallery, ProductInfo, ProductActions
- ✅ VariationSelector, WhatsAppButton
- ✅ Header, Footer, MobileNav

**Pendientes (Futuro):**

- ⏳ Button, Card, Input (components/ui/)
- ⏳ ContactForm con validación
- ⏳ SearchBar

---

## 📚 Referencias

- **Documentación:** `README.md`
- **Instrucciones concisas:** `.github/copilot-instructions.md`
- **Tipos:** `lib/types.ts`
- **Constantes:** `lib/constants/index.ts`
- **Queries:** `lib/supabase/queries.ts`
