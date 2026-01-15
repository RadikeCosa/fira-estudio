# Proyecto: Muma Estudio - Tienda de Textiles

## Stack Tecnológico

- **Next.js 16** (App Router) + **TypeScript** (strict mode)
- **Supabase** (PostgreSQL + Storage) con separación client/server
- **Tailwind CSS 4** (utility-first, light mode)
- **React Hook Form + Zod** (formularios - futuro)
- **Deploy:** Vercel con integración Supabase

## Contexto del Negocio

Tienda online de textiles artesanales: manteles, servilletas y caminos de mesa.
Productos con múltiples variaciones (tamaño/color).

- **V1 (MVP actual):** Catálogo visual + consultas por WhatsApp
- **V2 (futuro):** Carrito de compras + Mercado Pago

---

## Arquitectura y Estructura

### Directorios principales

```
/app                 → Pages y layouts (App Router)
/components          → Componentes React organizados por dominio
  /layout           → Header, Footer, MobileNav
  /productos        → ProductCard, ProductGallery, VariationSelector
  /ui               → Componentes reutilizables
/lib                 → Lógica de negocio y utilidades
  /constants        → Constantes centralizadas (SITE_CONFIG, WHATSAPP, etc.)
  /supabase         → Clientes y queries de Supabase
  /types.ts         → Tipos TypeScript compartidos
```

### Supabase: Esquema de Base de Datos

```sql
-- Tablas principales
categorias           → Categorías de productos (id, nombre, slug, descripcion)
productos            → Productos base (id, nombre, slug, descripcion, categoria_id)
variaciones          → SKUs con precio/tamaño/color (id, producto_id, tamaño, color, precio, stock)
imagenes_producto    → Galería de imágenes (id, producto_id, url, orden, es_principal)
consultas            → Formularios de contacto (id, nombre, email, mensaje, created_at)
```

---

## Reglas Fundamentales de Código

### TypeScript Estricto

```typescript
// ✅ SIEMPRE
- Tipos explícitos en funciones y variables
- interface para objetos, type para unions
- Nombres de datos/UI en español, código en inglés
- NUNCA usar 'any'

// ✅ Bien
interface Producto {
  nombre: string;      // Props de negocio en español
  precio: number;
}

async function getProductos(): Promise<Producto[]> {
  // Implementación
}

// ❌ Evitar
let data: any;
const productos = [];  // Sin tipo
function get() {}      // Sin tipos de retorno
```

---

### React: Server vs Client Components

```typescript
// ✅ REGLA DE ORO
Por defecto: Server Component (sin 'use client')
Usar 'use client' SOLO cuando necesites:
  - useState, useEffect, otros hooks
  - onClick, onChange, event handlers
  - Browser APIs (window, document, localStorage)

// ✅ Server Component (por defecto)
export async function ProductosPage() {
  const productos = await getProductos();  // Query directa
  return <ProductGrid productos={productos} />;
}

// ✅ Client Component (solo cuando es necesario)
'use client';
export function ProductFilter() {
  const [filtro, setFiltro] = useState('');
  const handleChange = (e) => setFiltro(e.target.value);
  return <input onChange={handleChange} />;
}
```

---

### Supabase: Separación Client/Server

**CRÍTICO:** Usar el cliente correcto según el contexto

```typescript
// ✅ En Server Components y queries
import { createClient } from "@/lib/supabase/server";

export async function getProductos() {
  const supabase = await createClient(); // Server client
  // ...
}

// ✅ En Client Components (interactividad)
("use client");
import { createClient } from "@/lib/supabase/client";

export function LikeButton() {
  const supabase = createClient(); // Browser client
  // ...
}

// ❌ NUNCA mezclar
("use client");
import { createClient } from "@/lib/supabase/server"; // ERROR
```

---

### Tailwind CSS

```tsx
// ✅ Formato legible en múltiples líneas
<div className="
  flex items-center justify-between
  px-4 py-6 rounded-lg
  bg-background border border-border
  hover:shadow-lg transition-shadow
  md:px-8 md:py-8
">

// ✅ Mobile-first (sin prefijo → sm → md → lg → xl)
<div className="
  grid grid-cols-1        // Mobile: 1 columna
  sm:grid-cols-2          // Tablet: 2 columnas
  lg:grid-cols-3          // Desktop: 3 columnas
">

// ✅ Usar variables CSS del proyecto
<div className="bg-background text-foreground border-border">

// ✅ Condicionales con clsx
import clsx from 'clsx';
<div className={clsx(
  'base-classes',
  isActive && 'active-classes',
  isPending && 'opacity-50'
)}>

// ❌ NUNCA CSS inline
<div style={{ padding: '16px' }}>
```

---

### Convenciones de Nombres

```typescript
// Componentes → PascalCase
ProductCard.tsx
VariationSelector.tsx

// Funciones y variables → camelCase
fetchProductos()
isLoading
currentUser

// Constantes → UPPER_SNAKE_CASE
SITE_CONFIG
API_ROUTES
WHATSAPP

// Booleans → prefijos is, has, should, can
isLoading
hasVariations
shouldDisplay
canPurchase

// Types e Interfaces → PascalCase
interface Producto { }
type ProductoCompleto = Producto & { variaciones: Variacion[] }

// Archivos → kebab-case para non-component files
product-utils.ts
format-price.ts
```

---

### Queries de Supabase

```typescript
// ✅ Siempre incluir relaciones necesarias con select()
const { data } = await supabase
  .from('productos')
  .select(`
    *,
    categoria:categorias(*),
    variaciones(*),
    imagenes:imagenes_producto(*)
  `)
  .order('created_at', { ascending: false });

// ✅ Filtros con .eq(), .in(), .gt(), etc.
const { data } = await supabase
  .from('productos')
  .select('*')
  .eq('categoria_id', categoriaId)
  .eq('disponible', true);

// ✅ Manejo de errores
const { data, error } = await supabase.from('productos').select('*');

if (error) {
  console.error('Error fetching productos:', error);
  throw new Error(ERROR_MESSAGES.loadingError);
}

return data ?? [];
```

---

### Flujo de WhatsApp (V1)

```typescript
// ✅ Formato de mensaje estándar
import { WHATSAPP } from '@/lib/constants';

function generarMensajeProducto(
  producto: Producto,
  variacion?: Variacion
): string {
  let mensaje = `Hola! Me interesa el producto:\n`;
  mensaje += `📦 ${producto.nombre}\n`;
  
  if (variacion) {
    mensaje += `📏 Tamaño: ${variacion.tamaño}\n`;
    mensaje += `🎨 Color: ${variacion.color}\n`;
    mensaje += `💰 Precio: $${variacion.precio}\n`;
  }
  
  mensaje += `\n¿Está disponible?`;
  return mensaje;
}

// Uso en componente
const whatsappUrl = WHATSAPP.getUrl(generarMensajeProducto(producto, variacion));
```

---

### Commits (Conventional Commits)

```bash
# Formato
<type>(<scope>): <description>

# Tipos principales
feat:      Nueva funcionalidad
fix:       Corrección de bugs
style:     Cambios de formato (no afectan lógica)
refactor:  Refactorización de código
docs:      Cambios en documentación
test:      Añadir o modificar tests
chore:     Tareas de mantenimiento

# Ejemplos
feat(productos): agregar filtro por categoría
fix(gallery): corregir navegación de imágenes
style(header): ajustar espaciado en mobile
refactor(types): consolidar interfaces de producto
docs(readme): actualizar instrucciones de instalación
```

---

## Constantes Centralizadas

**IMPORTANTE:** Usar siempre constantes en lugar de valores hardcoded

**Siempre usar constantes de `/lib/constants/` en lugar de valores hardcodeados.**

```typescript
// ✅ Usar constantes
import { SITE_CONFIG, WHATSAPP, ERROR_MESSAGES } from '@/lib/constants';

export const metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
};

// Para WhatsApp
const mensaje = `Hola! Me interesa el producto ${producto.nombre}`;
const url = WHATSAPP.getUrl(mensaje);

// Para errores
throw new Error(ERROR_MESSAGES.productNotFound);

// ❌ Evitar hardcodear valores
const siteName = "Muma Estudio";  // ❌ Usar SITE_CONFIG.name
const phone = "5492999123456";     // ❌ Usar WHATSAPP.number
```

**Constantes disponibles:**

- `SITE_CONFIG`: name, tagline, description, url, locale, keywords
- `WHATSAPP`: number, getUrl(message)
- `STORAGE`: productsPath, placeholdersPath, productPlaceholder
- `SUPABASE_STORAGE`: bucketName, getPublicUrl(path)
- `PAGINATION`: productsPerPage, maxProductsPerCategory
- `ERROR_MESSAGES`: productNotFound, noProducts, loadingError, connectionError
- `SUCCESS_MESSAGES`: consultaSent, productAdded
- `NAV_LINKS`: array de links de navegación
- `SOCIAL_LINKS`: instagram, email

---

## Estructura del Proyecto

```
app/
├── layout.tsx                  # Root layout con Header/Footer
├── page.tsx                    # Home page
├── productos/
│   ├── page.tsx               # Listado de productos
│   ├── loading.tsx            # Loading state
│   ├── error.tsx              # Error boundary
│   └── [slug]/
│       └── page.tsx           # Detalle de producto
├── contacto/
│   └── page.tsx               # Formulario de contacto
├── sobre-nosotros/
│   └── page.tsx               # Sobre nosotros
└── api/
    ├── productos/route.ts     # API de productos (futuro)
    └── consultas/route.ts     # API de consultas

components/
├── layout/
│   ├── Header.tsx             # Header (Server Component)
│   ├── Footer.tsx             # Footer (Server Component)
│   └── MobileNav.tsx          # Mobile nav (Client Component)
├── productos/
│   ├── ProductCard.tsx        # Card de producto
│   ├── ProductGrid.tsx        # Grid de productos
│   ├── ProductGallery.tsx     # Galería de imágenes
│   ├── VariationSelector.tsx # Selector variaciones (futuro)
│   └── ProductSkeleton.tsx    # Loading skeleton
└── ui/
    ├── Button.tsx             # Botón reutilizable
    ├── Card.tsx               # Card base
    └── Input.tsx              # Input base

lib/
├── supabase/
│   ├── client.ts              # Cliente para Client Components
│   ├── server.ts              # Cliente para Server Components
│   └── queries.ts             # Queries reutilizables
├── constants/
│   ├── index.ts               # Constantes globales
│   └── navigation.ts          # Links de navegación
├── types.ts                   # TypeScript types del proyecto
├── utils.ts                   # Funciones utilitarias
└── validations.ts             # Schemas de Zod (futuro)

public/
└── images/
    ├── productos/             # Imágenes de productos
    │   ├── manteles/
    │   ├── servilletas/
    │   └── caminos/
    └── placeholders/          # Placeholders
```

---

## Patrones Específicos del Proyecto

### Queries a Supabase

```typescript
// ✅ Siempre en lib/supabase/queries.ts
import { createClient } from "@/lib/supabase/server";
import type { ProductoCompleto } from "@/lib/types";

export async function getProductos(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `
    )
    .eq("activo", true)
    .order("destacado", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ✅ Usar en Server Components
import { getProductos } from "@/lib/supabase/queries";

export default async function ProductosPage() {
  const productos = await getProductos();
  return <ProductGrid productos={productos} />;
}
```

### Imágenes con Next.js Image

```typescript
import Image from 'next/image'
import { STORAGE } from '@/lib/constants'

// ✅ Siempre usar Next.js Image
<Image
  src={`${STORAGE.productsPath}/manteles/foto.jpg`}
  alt={producto.nombre}
  width={800}
  height={600}
  quality={85}
  priority={isPrincipal}
  className="rounded-lg"
/>

// ✅ Para imágenes de Supabase (futuro)
import { SUPABASE_STORAGE } from '@/lib/constants'
const imageUrl = SUPABASE_STORAGE.getPublicUrl(imagen.url)

<Image
  src={imageUrl}
  alt={imagen.alt_text || producto.nombre}
  width={800}
  height={600}
/>
```

### Integración WhatsApp

```typescript
import { WHATSAPP, SITE_CONFIG } from "@/lib/constants";

// ✅ Mensaje pre-formateado
function ConsultarButton({ producto, variacion }: Props) {
  const mensaje = `
    Hola! Me interesa este producto de ${SITE_CONFIG.name}:
    
    📦 ${producto.nombre}
    📏 Tamaño: ${variacion.tamanio}
    🎨 Color: ${variacion.color}
    💰 Precio: $${variacion.precio.toLocaleString("es-AR")}
    
    ¿Podrías darme más información?
  `.trim();

  const whatsappUrl = WHATSAPP.getUrl(mensaje);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="..."
    >
      Consultar por WhatsApp
    </a>
  );
}
```

### Manejo de Estados

```typescript
// ✅ Loading state
export default async function ProductosPage() {
  const productos = await getProductos();

  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-accent">{ERROR_MESSAGES.noProducts}</p>
      </div>
    );
  }

  return <ProductGrid productos={productos} />;
}

// ✅ Error boundary (app/productos/error.tsx)
("use client");
import { ERROR_MESSAGES } from "@/lib/constants";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600">{ERROR_MESSAGES.loadingError}</p>
      <button onClick={reset}>Reintentar</button>
    </div>
  );
}

// ✅ Loading (app/productos/loading.tsx)
export default function Loading() {
  return <ProductSkeleton count={12} />;
}
```

---

## 🚀 Patrones Comunes del Proyecto

### Cargar un producto completo

```typescript
import { createClient } from '@/lib/supabase/server';
import { ProductoCompleto } from '@/lib/types';

export async function getProductoBySlug(
  slug: string
): Promise<ProductoCompleto | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `)
    .eq('slug', slug)
    .single();
  
  if (error || !data) return null;
  return data as ProductoCompleto;
}
```

### Selector de variaciones (Client Component)

```typescript
'use client';

import { useState } from 'react';
import { Variacion } from '@/lib/types';

export function VariationSelector({ 
  variaciones,
  onSelect 
}: { 
  variaciones: Variacion[];
  onSelect: (v: Variacion) => void;
}) {
  const [selected, setSelected] = useState<Variacion | null>(null);
  
  const handleSelect = (variacion: Variacion) => {
    setSelected(variacion);
    onSelect(variacion);
  };
  
  return (
    <div className="space-y-4">
      {variaciones.map((v) => (
        <button
          key={v.id}
          onClick={() => handleSelect(v)}
          className={clsx(
            'px-4 py-2 rounded border',
            selected?.id === v.id && 'border-primary bg-primary/10'
          )}
        >
          {v.tamaño} - {v.color}
        </button>
      ))}
    </div>
  );
}
```

---

## 📝 Checklist de Revisión de Código

Antes de hacer commit, verificar:

- [ ] ¿Todos los tipos están explícitos (sin `any`)?
- [ ] ¿Estás usando el cliente de Supabase correcto (server vs client)?
- [ ] ¿Los Server Components no tienen `'use client'` innecesario?
- [ ] ¿Usaste constantes de `/lib/constants/` en lugar de hardcodear?
- [ ] ¿Las clases de Tailwind están formateadas en múltiples líneas?
- [ ] ¿El commit sigue Conventional Commits?
- [ ] ¿Manejaste los errores de Supabase correctamente?
- [ ] ¿Los nombres de props están en español (datos) e inglés (lógica)?

---

## Checklist Pre-Commit

```bash
□ Sin errores de TypeScript (npm run build)
□ Sin console.logs en código final
□ Maneja loading/error/empty states
□ Responsive en mobile/tablet/desktop
□ Usa constantes de lib/constants/
□ Imágenes con Next.js Image
□ Server/Client components correctos
□ UTF-8 encoding correcto
□ Commits convencionales (feat:/fix:/refactor:)
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Dev server (localhost:3000)
npm run build           # Build de producción
npm run start           # Preview producción local
npm run lint            # Linter

# Deploy
vercel                  # Deploy preview
vercel --prod          # Deploy a producción
vercel env pull        # Traer env vars de Vercel

# Git (conventional commits)
git commit -m "feat: agregar filtro de categorías"
git commit -m "fix: corregir precio en ProductCard"
git commit -m "refactor: mover queries a archivo separado"
git commit -m "style: mejorar responsive de header"
```

---

## Base de Datos (Supabase)

### Esquema Principal

**Tablas:**

- `categorias` (id, nombre, slug, descripcion, orden)
- `productos` (id, nombre, slug, descripcion, categoria_id, precio_desde, destacado, activo, material, cuidados, tiempo_fabricacion)
- `variaciones` (id, producto_id, tamanio, color, precio, stock, sku, activo)
- `imagenes_producto` (id, producto_id, url, alt_text, orden, es_principal)
- `consultas` (id, nombre, email, telefono, producto_id, variacion_id, mensaje, estado)

**Relaciones:**

- Producto → Categoría (muchos a uno)
- Producto → Variaciones (uno a muchos)
- Producto → Imágenes (uno a muchos)
- Consulta → Producto (muchos a uno)

**Queries disponibles:**

- `getCategorias()` - Lista todas las categorías
- `getProductos(categoriaSlug?)` - Lista productos (con filtro opcional)
- `getProductoBySlug(slug)` - Detalle de un producto

---

## Configuración del Proyecto

### Variables de Entorno (.env.local)

```bash
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# WhatsApp (opcional - tiene default)
NEXT_PUBLIC_WHATSAPP_NUMBER=5492999XXXXXX

# Contacto (opcional - tiene default)
NEXT_PUBLIC_CONTACT_EMAIL=contacto@mumaestudio.com
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/mumaestudio
```

### Paleta de Colores (globals.css)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --muted: #f5f5f5;
  --border: #e5e5e5;
  --accent: #737373;
}
```

---

## Notas Importantes

- **Idioma:** UI en español, código en inglés, comentarios en español para lógica de negocio
- **Encoding:** UTF-8 siempre (.vscode/settings.json configurado)
- **Formato moneda:** ARS con formato `$1.234,56` (usar `toLocaleString('es-AR')`)
- **Commits:** Conventional Commits (feat/fix/refactor/style/docs/test/chore)
- **Light mode only:** Dark mode planificado para V2

---

## Ejemplos de Uso

### Crear un nuevo componente de producto

```typescript
// components/productos/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import { STORAGE } from "@/lib/constants";
import type { Producto } from "@/lib/types";

interface ProductCardProps {
  producto: Producto;
  imagenPrincipal?: string;
}

export function ProductCard({ producto, imagenPrincipal }: ProductCardProps) {
  return (
    <Link href={`/productos/${producto.slug}`} className="group block">
      <div
        className="
        relative overflow-hidden rounded-lg
        border border-border
        hover:shadow-lg transition-shadow
      "
      >
        <Image
          src={imagenPrincipal || STORAGE.productPlaceholder}
          alt={producto.nombre}
          width={400}
          height={400}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
        />

        {producto.destacado && (
          <span className="absolute top-2 right-2 bg-accent text-background text-xs px-2 py-1 rounded">
            Destacado
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-medium text-foreground">{producto.nombre}</h3>
        {producto.precio_desde && (
          <p className="text-sm text-accent mt-1">
            Desde ${producto.precio_desde.toLocaleString("es-AR")}
          </p>
        )}
      </div>
    </Link>
  );
}
```

---

## 🔮 Preparación para V2 (Mercado Pago)

Cuando implementemos el carrito y pagos, considerar:

```typescript
// Estructura futura
interface CarritoItem {
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number;
}

interface Pedido {
  id: string;
  usuario_id: string;
  items: CarritoItem[];
  total: number;
  estado: 'pendiente' | 'pagado' | 'enviado' | 'cancelado';
  mercadopago_payment_id?: string;
  created_at: string;
}
```

Mantener el código actual flexible para esta migración.
