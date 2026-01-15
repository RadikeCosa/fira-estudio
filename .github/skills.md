# Skills de Copilot para Muma Estudio

Este archivo define las habilidades y conocimientos específicos que GitHub Copilot debe tener al trabajar en este proyecto de e-commerce de textiles artesanales.

---

## 🎯 Dominio del Negocio

### Entender el modelo de producto textil

Copilot debe comprender que:
- Cada **producto base** (ej: "Mantel Floral") tiene múltiples **variaciones**
- Las variaciones se definen por: **tamaño**, **color**, **precio** y **stock**
- Los precios NO son únicos por producto, sino por variación
- Las imágenes pueden ser compartidas entre variaciones o específicas

**Ejemplo de estructura:**

```typescript
Producto: "Mantel Floral"
├── Variación 1: 150x200cm - Rojo - $15,000
├── Variación 2: 150x200cm - Azul - $15,000
├── Variación 3: 180x250cm - Rojo - $18,500
└── Variación 4: 180x250cm - Azul - $18,500
```

### Flujo de compra actual (V1)

1. Usuario navega el catálogo de productos
2. Selecciona un producto para ver detalles
3. Elige una variación específica (tamaño + color)
4. Hace clic en "Consultar por WhatsApp"
5. Se abre WhatsApp con mensaje pre-formateado
6. La venta se cierra por fuera de la plataforma

**NO hay carrito de compras ni pagos online en V1**

---

## 🛠️ Skills Técnicas

### 1. Manejo de Relaciones en Supabase

Copilot debe saber construir queries con relaciones complejas:

```typescript
// Producto con todas sus relaciones
const { data } = await supabase
  .from('productos')
  .select(`
    *,
    categoria:categorias(id, nombre, slug),
    variaciones(id, tamaño, color, precio, stock, disponible),
    imagenes:imagenes_producto(id, url, alt_text, orden, es_principal)
  `)
  .eq('slug', slug)
  .order('variaciones(precio)', { ascending: true })
  .order('imagenes(orden)', { ascending: true });
```

**Relaciones clave:**
- `productos` → `categorias` (many-to-one)
- `productos` → `variaciones` (one-to-many)
- `productos` → `imagenes_producto` (one-to-many)

### 2. Tipado de Datos de Supabase

```typescript
// Mapeo tabla → tipo TypeScript
import type { Database } from '@/lib/database.types';  // Generado con supabase gen types

type Producto = Database['public']['Tables']['productos']['Row'];
type Variacion = Database['public']['Tables']['variaciones']['Row'];

// Tipos compuestos para queries con joins
type ProductoCompleto = Producto & {
  categoria: Categoria | null;
  variaciones: Variacion[];
  imagenes: ImagenProducto[];
};
```

### 3. Composición de URLs de WhatsApp

```typescript
// Formato estándar de mensaje
function generarMensajeWhatsApp(
  producto: Producto,
  variacion: Variacion
): string {
  const mensaje = [
    '¡Hola! Me interesa este producto:',
    '',
    `📦 Producto: ${producto.nombre}`,
    `📏 Tamaño: ${variacion.tamaño}`,
    `🎨 Color: ${variacion.color}`,
    `💰 Precio: ${formatPrice(variacion.precio)}`,
    '',
    '¿Está disponible?'
  ].join('\n');
  
  return mensaje;
}

// URL encoding
const whatsappUrl = `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(mensaje)}`;
```

### 4. Optimización de Imágenes

```typescript
// Next.js Image component con Supabase Storage
import Image from 'next/image';

<Image
  src={imagen.url}
  alt={imagen.alt_text || producto.nombre}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover rounded-lg"
  priority={imagen.es_principal}  // LCP optimization
/>
```

### 5. Manejo de Estados de Carga

```typescript
// Pattern: Loading states con Suspense
import { Suspense } from 'react';

export default function ProductosPage() {
  return (
    <Suspense fallback={<ProductosSkeleton />}>
      <ProductosContent />
    </Suspense>
  );
}

// O con loading.tsx en App Router
// app/productos/loading.tsx
export default function Loading() {
  return <ProductosSkeleton />;
}
```

---

## 🎨 Skills de UI/UX

### 1. Responsive Design Mobile-First

```tsx
// Pattern: Desktop tiene más columnas
<div className="
  grid grid-cols-1           // Mobile: 1 columna
  sm:grid-cols-2             // Tablet: 2 columnas
  lg:grid-cols-3             // Desktop: 3 columnas
  xl:grid-cols-4             // Large: 4 columnas
  gap-4 sm:gap-6
">
```

### 2. Diseño de Product Cards

```tsx
// Estructura estándar de tarjeta
<article className="group relative">
  {/* Imagen con hover effect */}
  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
    <Image 
      src={imagen.url}
      className="object-cover transition-transform group-hover:scale-105"
    />
  </div>
  
  {/* Info del producto */}
  <div className="mt-4 space-y-2">
    <h3 className="font-medium">{producto.nombre}</h3>
    <p className="text-sm text-muted-foreground">{categoria.nombre}</p>
    
    {/* Rango de precios si hay múltiples variaciones */}
    {variaciones.length > 1 ? (
      <p className="text-sm">
        Desde ${Math.min(...variaciones.map(v => v.precio))}
      </p>
    ) : (
      <p className="font-semibold">${variaciones[0].precio}</p>
    )}
  </div>
</article>
```

### 3. Galería de Imágenes

```tsx
// Pattern: Thumbnails + imagen principal
'use client';

import { useState } from 'react';

export function ProductGallery({ imagenes }: { imagenes: ImagenProducto[] }) {
  const [imagenActual, setImagenActual] = useState(0);
  
  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="aspect-square overflow-hidden rounded-lg">
        <Image src={imagenes[imagenActual].url} ... />
      </div>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {imagenes.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setImagenActual(idx)}
            className={clsx(
              'aspect-square rounded border-2',
              idx === imagenActual ? 'border-primary' : 'border-transparent'
            )}
          >
            <Image src={img.url} ... />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Skills de Testing (Futuro)

Cuando agreguemos tests, Copilot debe saber:

```typescript
// Unit test de utilidad
import { formatPrice } from '@/lib/utils/format';

describe('formatPrice', () => {
  it('formatea precios argentinos correctamente', () => {
    expect(formatPrice(15000)).toBe('$15.000');
    expect(formatPrice(1500.50)).toBe('$1.500,50');
  });
});

// Integration test de query
import { getProductos } from '@/lib/supabase/queries';

describe('getProductos', () => {
  it('retorna productos con sus relaciones', async () => {
    const productos = await getProductos();
    expect(productos[0]).toHaveProperty('categoria');
    expect(productos[0]).toHaveProperty('variaciones');
  });
});
```

---

## 🔮 Skills para V2 (Próximas Features)

### Carrito de Compras

```typescript
// Context de carrito
'use client';

import { createContext, useContext, useState } from 'react';

interface CarritoItem {
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number;
}

interface CarritoContextType {
  items: CarritoItem[];
  agregarItem: (item: CarritoItem) => void;
  removerItem: (variacion_id: string) => void;
  vaciarCarrito: () => void;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito must be used within CarritoProvider');
  return context;
}
```

### Integración con Mercado Pago

```typescript
// Server action para crear preferencia
'use server';

import mercadopago from 'mercadopago';

export async function crearPreferencia(items: CarritoItem[]) {
  const preference = {
    items: items.map(item => ({
      title: item.producto_nombre,
      unit_price: item.precio_unitario,
      quantity: item.cantidad,
    })),
    back_urls: {
      success: `${SITE_CONFIG.url}/checkout/success`,
      failure: `${SITE_CONFIG.url}/checkout/failure`,
      pending: `${SITE_CONFIG.url}/checkout/pending`,
    },
    auto_return: 'approved',
  };
  
  const response = await mercadopago.preferences.create(preference);
  return response.body.init_point;  // URL de checkout
}
```

---

## 📊 Skills de Rendimiento

### 1. Caché de Queries

```typescript
// Next.js App Router - revalidación automática
export const revalidate = 3600;  // 1 hora

export async function getProductos() {
  const supabase = await createClient();
  // Query se cachea automáticamente
  const { data } = await supabase.from('productos').select('*');
  return data;
}
```

### 2. Lazy Loading de Imágenes

```tsx
// Cargar imágenes bajo el fold lazy
<Image
  src={producto.imagen}
  loading="lazy"  // Solo imágenes fuera del viewport inicial
  placeholder="blur"
  blurDataURL={producto.blur_hash}
/>
```

### 3. Prefetching de Links

```tsx
import Link from 'next/link';

// Next.js prefetchea automáticamente en viewport
<Link href={`/productos/${producto.slug}`} prefetch={true}>
  Ver Producto
</Link>
```

---

## 🔐 Skills de Seguridad

### 1. Validación de Inputs

```typescript
import { z } from 'zod';

const consultaSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto').max(100),
  email: z.string().email('Email inválido'),
  mensaje: z.string().min(10, 'Mensaje muy corto').max(1000),
});

// Uso en server action
'use server';

export async function enviarConsulta(formData: FormData) {
  const parsed = consultaSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    mensaje: formData.get('mensaje'),
  });
  
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  
  // Guardar en Supabase...
}
```

### 2. Sanitización de URLs

```typescript
// NUNCA confiar en URLs de usuario sin validar
function isValidProductSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function getProductoBySlug(slug: string) {
  if (!isValidProductSlug(slug)) {
    throw new Error('Slug inválido');
  }
  // Query...
}
```

---

## 🎓 Skills de Accesibilidad

```tsx
// Semantic HTML
<article aria-labelledby={`producto-${producto.id}`}>
  <h2 id={`producto-${producto.id}`}>{producto.nombre}</h2>
</article>

// Alt text descriptivo
<Image
  src={imagen.url}
  alt={`${producto.nombre} - ${variacion.color}, tamaño ${variacion.tamaño}`}
/>

// Estados de loading accesibles
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (
    <>
      <span className="sr-only">Cargando...</span>
      <Spinner />
    </>
  ) : (
    'Consultar por WhatsApp'
  )}
</button>

// Focus management
<button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
```

---

## 🗂️ Skills de Organización de Código

### Separación de Concerns

```
components/
├── layout/          → Header, Footer, Navigation (estructura general)
├── productos/       → ProductCard, ProductGallery, VariationSelector
├── ui/              → Button, Input, Card (primitivos reutilizables)
└── forms/           → ContactForm, NewsletterForm (futuro)

lib/
├── constants/       → Configuración global (SITE_CONFIG, WHATSAPP, etc.)
├── supabase/        → Cliente y queries específicas
├── utils/           → Funciones utilitarias (formatPrice, slugify, etc.)
└── types.ts         → Tipos compartidos en todo el proyecto
```

### Naming Patterns

```typescript
// Queries → get[Resource](s)
getProductos()
getProductoBySlug()
getCategorias()

// Mutations → create/update/delete[Resource]
createConsulta()
updateProducto()
deleteVariacion()

// Utils → verbo descriptivo
formatPrice()
slugify()
truncateText()

// Components → sustantivo descriptivo
ProductCard
VariationSelector
WhatsAppButton
```

---

## 📈 Métricas de Éxito

Copilot debe optimizar para:

- **Performance:** Core Web Vitals (LCP &lt; 2.5s, CLS &lt; 0.1, FID &lt; 100ms)
- **SEO:** Metadata correcta, structured data
- **Accesibilidad:** WCAG 2.1 AA compliance
- **Type Safety:** 0 errores de TypeScript, 0 usos de `any`
- **Bundle Size:** Mantener bajo con Server Components

---

**Última actualización:** 2026-01-15  
**Versión:** 1.0
