# 📁 Estructura del Proyecto - Para Nuevos Desarrolladores

Bienvenido a Fira Estudio. Este documento explica cómo está organizado el código de forma que puedas entender dónde poner cada cosa.

**No necesitas experiencia previa en Next.js o TypeScript. Este doc explica todo desde cero.**

---

## ¿Qué es una "app folder"? (Next.js 16 - App Router)

En Next.js 16, la carpeta `app/` contiene tus **páginas** y **diseños**. Cada archivo `.tsx` en `app/` se convierte automáticamente en una ruta web.

```
app/
├── layout.tsx          → http://tutienda.com/ (envuelve todas las páginas)
├── page.tsx            → http://tutienda.com/
├── contacto/
│   └── page.tsx        → http://tutienda.com/contacto
├── productos/
│   ├── page.tsx        → http://tutienda.com/productos
│   └── [slug]/
│       └── page.tsx    → http://tutienda.com/productos/mantel-floral
└── sobre-nosotros/
    └── page.tsx        → http://tutienda.com/sobre-nosotros
```

**Analogía:** La carpeta `app/` es como un **menú de restaurante**. Cada archivo es una página del menú.

---

## ¿Qué es una "lib folder"? (Lógica de negocio)

La carpeta `lib/` contiene todo el código que **NO es un componente visual**. Es donde vive la "inteligencia" de tu aplicación:

- **Consultas a la base de datos** (`lib/supabase/queries.ts`)
- **Patrones para obtener datos** (`lib/repositories/`)
- **Funciones útiles** (`lib/utils/`)
- **Tipos TypeScript** (`lib/types.ts`)
- **Configuración** (`lib/constants/`, `lib/config/`)
- **Almacenamiento en caché** (`lib/cache/`)
- **Manejo de errores** (`lib/errors/`)

**Analogía:** La carpeta `lib/` es como la **cocina de un restaurante**. La carpeta `app/` y `components/` es como el **comedor**.

```
app/              ← COMEDOR (páginas que ven los usuarios)
components/       ← DECORACIÓN (componentes visuales reutilizables)
lib/              ← COCINA (lógica, datos, funciones útiles)
```

---

## Estructura Jerárquica Completa

```
proyecto/
├── app/                    # Páginas y rutas (Next.js App Router)
│   ├── layout.tsx         # Envoltura para todas las páginas
│   ├── page.tsx           # Página de inicio
│   ├── api/               # API routes (REST endpoints)
│   ├── contacto/
│   ├── productos/
│   ├── sobre-nosotros/
│   └── [parametros]/      # Rutas dinámicas (ej: [slug])
│
├── components/            # Componentes React reutilizables
│   ├── layout/           # Header, Footer, MobileNav
│   ├── productos/        # ProductCard, ProductGrid, VariationSelector
│   ├── home/             # HeroSection, FeaturedProducts, etc.
│   ├── contacto/         # ContactForm, ContactInfo
│   ├── errors/           # ErrorDisplay, NotFoundError
│   └── ui/               # Primitivos (Button, Card, Input, etc.)
│
├── lib/                   # Lógica de negocio y utilidades
│   ├── types.ts          # Definiciones de tipos TypeScript
│   ├── constants/        # SITE_CONFIG, WHATSAPP, ERROR_MESSAGES
│   ├── supabase/         # Clientes de Supabase (server.ts, client.ts)
│   ├── repositories/     # Acceso a datos (ProductoRepository)
│   ├── utils/            # Funciones helpers (formatPrice, cn, etc.)
│   ├── cache/            # Funciones para caché
│   ├── errors/           # Tipos y manejo de errores
│   ├── content/          # Textos centralizados (HOME_CONTENT, etc.)
│   ├── design/           # Tokens de diseño (TYPOGRAPHY, SPACING, COLORS)
│   ├── seo/              # Funciones para metadata
│   ├── analytics/        # Google Analytics
│   └── storage/          # Supabase Storage
│
├── hooks/                # Hooks React personalizados
│   ├── useRateLimit.ts  # Control de tasa de solicitudes
│   ├── useEscapeKey.ts  # Detectar tecla Escape
│   └── useScrollLock.ts # Bloquear scroll
│
├── public/               # Archivos estáticos (imágenes, favicon)
│   └── images/
│
├── docs/                 # Documentación
│   └── ONBOARDING/      # (Este archivo está aquí)
│
├── package.json          # Dependencias del proyecto
├── tsconfig.json         # Configuración de TypeScript
├── next.config.ts        # Configuración de Next.js
├── tailwind.config.ts    # Configuración de estilos
└── vitest.config.ts      # Configuración de tests
```

---

## ¿Dónde Pongo X?

### Tengo una nueva página

➜ Crea un archivo en la carpeta `app/`

```
Quiero una página "Promociones" en http://tutienda.com/promociones

✅ CORRECTO: Crea app/promociones/page.tsx
```

**Patrón:**

```typescript
// app/promociones/page.tsx
import { PROMOCIONES_CONTENT } from "@/lib/content/promociones";
import { TYPOGRAPHY, SPACING } from "@/lib/design/tokens";

export const metadata = {
  title: "Promociones - Fira Estudio",
  description: "Descubre nuestras promociones especiales",
};

export default function PromocionesPage() {
  return (
    <main className={SPACING.sectionPadding.md}>
      <h1 className={TYPOGRAPHY.heading.page}>
        {PROMOCIONES_CONTENT.title}
      </h1>
      {/* ... más contenido */}
    </main>
  );
}
```

---

### Tengo un hook personalizado (reutilizable)

➜ Crea un archivo en la carpeta `hooks/`

```
Necesito un hook para detectar si el usuario scrolleó

✅ CORRECTO: Crea hooks/useScroll.ts
```

**Patrón:**

```typescript
// hooks/useScroll.ts
"use client";

import { useState, useEffect } from "react";

export function useScroll() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
}
```

---

### Tengo una función útil (reutilizable)

➜ Crea un archivo en la carpeta `lib/utils/`

```
Necesito una función para formatear moneda

✅ CORRECTO: Crea lib/utils/format.ts (o añade a uno existente)
```

**Patrón:**

```typescript
// lib/utils/format.ts
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
}
```

---

### Tengo una nueva consulta a la base de datos

➜ Crea en `lib/supabase/queries.ts` o en `lib/repositories/`

```
Necesito obtener los productos más vendidos

✅ CORRECTO (Opción 1): Añade a lib/supabase/queries.ts
✅ CORRECTO (Opción 2): Crea un método en ProductoRepository
```

**Patrón (queries.ts):**

```typescript
// lib/supabase/queries.ts
import { createClient } from "@/lib/supabase/server";

export async function getProductosMasVendidos(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*, variaciones(*), imagenes(*)")
    .eq("activo", true)
    .eq("mas_vendidos", true)
    .order("nombre");

  if (error) throw error;
  return data || [];
}
```

---

### Tengo un componente reutilizable

➜ Crea en `components/`

```
Necesito mostrar un "badge" de descuento

✅ CORRECTO: Crea components/ui/DiscountBadge.tsx
```

**Patrón:**

```typescript
// components/ui/DiscountBadge.tsx
interface DiscountBadgeProps {
  percentage: number;
}

export function DiscountBadge({ percentage }: DiscountBadgeProps) {
  return (
    <span className="bg-red-500 text-white px-2 py-1 rounded">
      -{percentage}%
    </span>
  );
}
```

---

### Tengo un error personalizado

➜ Crea en `lib/errors/`

```
Necesito un error para "producto no disponible"

✅ CORRECTO: Crea lib/errors/ProductoError.ts
```

**Patrón:**

```typescript
// lib/errors/ProductoError.ts
export class ProductoError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "ProductoError";
  }
}
```

---

### Tengo un tipo TypeScript

➜ Añade a `lib/types.ts` o crea un nuevo archivo

```
Necesito un tipo para "Promoción"

✅ CORRECTO: Añade a lib/types.ts
```

**Patrón:**

```typescript
// lib/types.ts
export interface Promocion {
  id: string;
  nombre: string;
  descripcion: string;
  porcentajeDescuento: number;
  fechaInicio: string;
  fechaFin: string;
}
```

---

### Tengo texto que se repite

➜ Añade a `lib/content/`

```
Tengo texto del home que aparece en varias páginas

✅ CORRECTO: Crea lib/content/home.ts
```

**Patrón:**

```typescript
// lib/content/home.ts
export const HOME_CONTENT = {
  hero: {
    title: "Manteles de Lujo Artesanales",
    subtitle: "Textiles premium para tu mesa",
    cta: {
      primary: "Ver Catálogo",
      secondary: "Conocer Más",
    },
  },
  featured: {
    title: "Productos Destacados",
    emptyState: "No hay productos destacados",
  },
};
```

---

### Tengo estilos que se repiten

➜ Añade a `lib/design/tokens.ts`

```
Necesito usar el mismo padding en varias páginas

✅ CORRECTO: Usa SPACING de lib/design/tokens.ts
```

**Patrón:**

```typescript
// lib/design/tokens.ts
export const SPACING = {
  sectionPadding: {
    sm: "px-4 py-12",
    md: "px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36",
    lg: "px-6 py-32 sm:px-8 sm:py-40",
  },
};

// Uso en componentes:
<section className={SPACING.sectionPadding.md}>
```

---

## Convenciones de Nombres de Archivo

| Tipo                | Ejemplo                 | Ubicación                 |
| ------------------- | ----------------------- | ------------------------- |
| **Página**          | `page.tsx`              | `app/productos/page.tsx`  |
| **Layout**          | `layout.tsx`            | `app/layout.tsx`          |
| **Componente**      | `ProductCard.tsx`       | `components/productos/`   |
| **Query**           | `getProductos()`        | `lib/supabase/queries.ts` |
| **Hook**            | `useRateLimit.ts`       | `hooks/`                  |
| **Utilidad**        | `formatPrice.ts`        | `lib/utils/`              |
| **Tipo**            | `Producto`, `Variacion` | `lib/types.ts`            |
| **Contenido**       | `HOME_CONTENT`          | `lib/content/home.ts`     |
| **Token de diseño** | `TYPOGRAPHY`            | `lib/design/tokens.ts`    |
| **Constante**       | `SITE_CONFIG`           | `lib/constants/`          |
| **Error**           | `ProductoError`         | `lib/errors/`             |
| **Test**            | `ProductCard.test.tsx`  | junto al archivo          |

**Reglas:**

- **Componentes:** `PascalCase` (`ProductCard.tsx`)
- **Funciones/variables:** `camelCase` (`getProductos`, `isLoading`)
- **Constantes:** `UPPER_SNAKE_CASE` (`SITE_CONFIG`, `MAX_RETRIES`)
- **Booleans:** prefijo `is/has/should` (`isLoading`, `hasError`)
- **Contenido:** `UPPER_SNAKE_CASE` + sufijo `_CONTENT` (`HOME_CONTENT`)
- **Tokens de diseño:** `UPPER_SNAKE_CASE` (`TYPOGRAPHY`, `SPACING`)

---

## Rutas de Importación (@/alias)

Next.js tiene un alias `@/` que apunta a la raíz del proyecto. Úsalo siempre para mantener importaciones limpias:

```typescript
// ✅ CORRECTO (usa @/ alias)
import { HOME_CONTENT } from "@/lib/content/home";
import { ProductCard } from "@/components/productos/ProductCard";
import type { Producto } from "@/lib/types";

// ❌ INCORRECTO (rutas relativas complicadas)
import { HOME_CONTENT } from "../../../lib/content/home";
import { ProductCard } from "../../components/productos/ProductCard";
```

**Ventajas:**

- Más fácil refactorizar archivos
- Importaciones igual de legibles desde cualquier lugar
- No necesitas contar niveles (`../../../`)

---

## Componentes del Servidor vs Cliente

### Componentes del Servidor (por defecto)

Los componentes en Next.js 16 son **Componentes del Servidor** por defecto. Esto significa:

- ✅ Pueden hacer consultas a la base de datos
- ✅ Pueden generar metadata (SEO)
- ✅ El código NO se envía al navegador del usuario
- ❌ NO pueden usar hooks (`useState`, `useEffect`)
- ❌ NO pueden usar eventos del navegador

```typescript
// app/productos/page.tsx (Componente del Servidor por defecto)
import { getProductos } from "@/lib/supabase/queries";

export const metadata = {
  title: "Productos - Fira Estudio",
};

export default async function ProductosPage() {
  // ✅ Consulta directa a la BD (SOLO en Servidor)
  const productos = await getProductos();

  return (
    <main>
      {productos.map(producto => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </main>
  );
}
```

---

### Componentes del Cliente ('use client')

Cuando necesitas **interactividad** (hooks, eventos), añade `'use client'` al inicio del archivo:

```typescript
// components/productos/VariationSelector.tsx
'use client';

import { useState } from 'react';

interface VariationSelectorProps {
  variaciones: Variacion[];
  onSelect: (variacion: Variacion) => void;
}

export function VariationSelector({ variaciones, onSelect }: VariationSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <select
      value={selected || ""}
      onChange={(e) => {
        const variacion = variaciones.find(v => v.id === e.target.value);
        if (variacion) {
          setSelected(e.target.value);
          onSelect(variacion);
        }
      }}
    >
      <option value="">Selecciona un tamaño</option>
      {variaciones.map(v => (
        <option key={v.id} value={v.id}>
          {v.tamanio} - ${v.precio}
        </option>
      ))}
    </select>
  );
}
```

---

### Decidir: ¿Servidor o Cliente?

| Necesidad              | Usa      | Razón                       |
| ---------------------- | -------- | --------------------------- |
| Mostrar datos          | Servidor | Consulta la BD              |
| Hacer consultas        | Servidor | Credenciales seguras        |
| Usar hooks             | Cliente  | `'use client'`              |
| Manejar clics          | Cliente  | Eventos interactivos        |
| Acceder `localStorage` | Cliente  | API del navegador           |
| Generar metadata       | Servidor | SEO                         |
| Usar `useEffect`       | Cliente  | Efecto del lado del cliente |

---

## Estructura de una Página Típica

```typescript
// app/productos/page.tsx
'use server'; // Explícito: esta es una página del servidor

import { getProductos } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/productos/ProductGrid";
import { PRODUCTOS_CONTENT } from "@/lib/content/productos";
import { TYPOGRAPHY, SPACING } from "@/lib/design/tokens";

// Metadata para SEO
export const metadata = {
  title: `${PRODUCTOS_CONTENT.title} - Fira Estudio`,
  description: PRODUCTOS_CONTENT.description,
  openGraph: {
    title: PRODUCTOS_CONTENT.title,
    description: PRODUCTOS_CONTENT.description,
  },
};

// Configurar caché (revalidar cada 1 hora)
export const revalidate = 3600;

// Parámetro de página (ej: ?page=1)
interface ProductosPageProps {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}

export default async function ProductosPage(props: ProductosPageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1", 10);
  const categoria = searchParams.categoria;

  // Consulta
  const { items, total } = await getProductos({
    categoria,
    limit: 12,
    offset: (page - 1) * 12,
  });

  return (
    <main className={SPACING.sectionPadding.md}>
      <h1 className={TYPOGRAPHY.heading.page}>
        {PRODUCTOS_CONTENT.title}
      </h1>

      {/* Componente reutilizable */}
      <ProductGrid productos={items} />

      {/* Paginación */}
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / 12)}
      />
    </main>
  );
}
```

---

## Flujo de Datos Típico

```
┌─────────────────────────────────────────────────────────┐
│ Página (app/productos/page.tsx)                         │
│ - Componente del Servidor                               │
│ - Consulta getProductos()                               │
│ - Genera metadata                                       │
└─────────────────────┬───────────────────────────────────┘
                      │ pasa productos como props
                      ▼
┌─────────────────────────────────────────────────────────┐
│ ProductGrid (components/productos/ProductGrid.tsx)     │
│ - Componente del Servidor                               │
│ - Recibe array de productos                             │
│ - Renderiza list de ProductCard                         │
└─────────────────────┬───────────────────────────────────┘
                      │ pasa producto individual como props
                      ▼
┌─────────────────────────────────────────────────────────┐
│ ProductCard (components/productos/ProductCard.tsx)     │
│ - Componente del Servidor (mostrar datos)               │
│ - Recibe un producto                                    │
│ - Si necesita interactividad: wrap VariationSelector   │
└─────────────────────┬───────────────────────────────────┘
                      │ pasa variaciones como props
                      ▼
┌─────────────────────────────────────────────────────────┐
│ VariationSelector (components/productos/...)           │
│ - Componente del Cliente ('use client')                 │
│ - Maneja clicks y estado                                │
│ - Llamadas callback al padre                            │
└─────────────────────────────────────────────────────────┘
```

---

## Errores Comunes

### ❌ Error 1: Importar del cliente en componente del servidor

```typescript
// ❌ INCORRECTO
"use client";
import { getProductos } from "@/lib/supabase/queries"; // NO!

export default function Page() {
  const productos = await getProductos(); // ✗ NO se puede usar await
}
```

**Solución:** Importa en componente del servidor:

```typescript
// ✅ CORRECTO
import { getProductos } from "@/lib/supabase/queries";

export default async function Page() {
  const productos = await getProductos(); // ✓ Funciona
  return <ProductGrid productos={productos} />;
}
```

---

### ❌ Error 2: Hardcodear texto y estilos

```typescript
// ❌ INCORRECTO
<h1 className="text-4xl font-bold">Fira Estudio</h1>
<section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
```

**Solución:** Usa contenido y tokens centralizados:

```typescript
// ✅ CORRECTO
import { HOME_CONTENT } from "@/lib/content/home";
import { TYPOGRAPHY, SPACING } from "@/lib/design/tokens";

<h1 className={TYPOGRAPHY.heading.page}>{HOME_CONTENT.title}</h1>
<section className={SPACING.sectionPadding.md}>
```

---

### ❌ Error 3: Confundir servidor y cliente

```typescript
// ❌ INCORRECTO
export default async function Page() {
  const [count, setCount] = useState(0); // ✗ NO! useState en servidor
  const productos = await getProductos();
}
```

**Solución:** Separa en dos componentes:

```typescript
// ✅ CORRECTO - app/page.tsx (Servidor)
export default async function Page() {
  const productos = await getProductos();
  return <ProductList productos={productos} />;
}

// ✅ CORRECTO - components/ProductList.tsx (Cliente)
'use client';
export function ProductList({ productos }) {
  const [filter, setFilter] = useState("");
}
```

---

### ❌ Error 4: No especificar tipos en funciones

```typescript
// ❌ INCORRECTO
function handleClick(e) {
  // ¿Qué es 'e'?
}

async function getData() {
  // ¿Qué retorna?
}
```

**Solución:** Siempre añade tipos explícitos:

```typescript
// ✅ CORRECTO
function handleClick(e: React.MouseEvent<HTMLButtonElement>): void {
  console.log(e.target);
}

async function getData(): Promise<Producto[]> {
  return supabase.from("productos").select("*");
}
```

---

### ❌ Error 5: Usar 'any' en TypeScript

```typescript
// ❌ INCORRECTO
const data: any = response.json();
```

**Solución:** Define tipos específicos:

```typescript
// ✅ CORRECTO
interface ApiResponse {
  productos: ProductoCompleto[];
  total: number;
}

const data: ApiResponse = await response.json();
```

---

## Checklist: Entiendo la Estructura

- [ ] Entiendo qué va en `app/` (páginas)
- [ ] Entiendo qué va en `components/` (componentes reutilizables)
- [ ] Entiendo qué va en `lib/` (lógica, datos, funciones)
- [ ] Sé por qué separamos en servidor vs cliente
- [ ] Sé cómo decidir dónde poner un archivo nuevo
- [ ] Entiendo el alias `@/` y por qué se usa
- [ ] Sé que los tipos van con mayúscula (Producto, Variacion)
- [ ] Sé que las constantes van en UPPER_SNAKE_CASE
- [ ] He visto dónde está centralizado el contenido (`lib/content/`)
- [ ] He visto dónde están los tokens de diseño (`lib/design/tokens.ts`)

---

## Siguientes Pasos

1. **Abre [DATA_AND_QUERIES.md](DATA_AND_QUERIES.md)** si necesitas entender cómo hacer consultas a la base de datos
2. **Abre [docs/CACHING_ARCHITECTURE.md](../CACHING_ARCHITECTURE.md)** si necesitas entender cómo cachear datos
3. **Abre [docs/error-boundaries.md](../error-boundaries.md)** si algo rompe y necesitas manejar errores
4. **Lee el archivo `copilot-instructions.md`** en la raíz del proyecto para reglas más detalladas

**¿Listo para codificar?** Crea tu primer archivo en `app/` y comienza. 🚀

---

## Referencias Rápidas

- **Archivo de instrucciones:** `.github/instructions/copilot-instructions.instructions.md`
- **Documentación avanzada:** Ver [docs/ONBOARDING/README.md](README.md)
- **Tests:** Revisa `*.test.tsx` para ver cómo escribir tests
- **Configuración:** `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`
