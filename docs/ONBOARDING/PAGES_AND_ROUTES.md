# Pages & Routes - Onboarding Guide

**Última actualización:** 29 de enero de 2026  
**Stack:** Next.js 16 App Router  
**Routing:** Basado en estructura de carpetas

---

## Índice

1. [App Router Basics](#app-router-basics)
2. [Rutas del Proyecto](#rutas-del-proyecto)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Root Layout](#root-layout)
5. [Páginas por Dominio](#páginas-por-dominio)
6. [Dinámicas: [slug]](#dinámicas-slug)
7. [Error Handling](#error-handling)
8. [API Routes](#api-routes)
9. [SEO & Metadata](#seo--metadata)
10. [Performance (ISR & Revalidation)](#performance-isr--revalidation)

---

## App Router Basics

### Convención de Carpetas

En Next.js 16 App Router, la estructura de carpetas define las rutas:

```
app/
├── layout.tsx          → Wrapper layout (root)
├── page.tsx            → GET /
├── error.tsx           → Error boundary
├── not-found.tsx       → 404 custom
│
├── productos/
│   ├── layout.tsx      → Layout para /productos
│   ├── page.tsx        → GET /productos
│   ├── error.tsx       → Error boundary para /productos
│   └── [slug]/
│       └── page.tsx    → GET /productos/[slug]
│
└── contacto/
    ├── layout.tsx      → Layout para /contacto
    └── page.tsx        → GET /contacto
```

### Archivos Especiales

| Archivo         | Propósito            | Ejemplo                    |
| --------------- | -------------------- | -------------------------- |
| `layout.tsx`    | Wrapper persistente  | Navegación, footer         |
| `page.tsx`      | Contenido de la ruta | Home, productos, contacto  |
| `error.tsx`     | Error boundary       | Manejo de errores en ruta  |
| `not-found.tsx` | 404 custom           | Página no encontrada       |
| `loading.tsx`   | Suspense fallback    | Placeholder mientras carga |
| `route.ts`      | API handler          | GET, POST, PUT, DELETE     |

---

## Rutas del Proyecto

### Mapa Completo de Rutas

```
┌─ / (Home)
│  ├─ Hero Section
│  ├─ Featured Products
│  ├─ Collections
│  └─ Final CTA
│
├─ /productos (Listing)
│  ├─ Search params: ?categoria={slug}&page={n}
│  ├─ Category Filter
│  ├─ Product Grid (12 items/page)
│  └─ Pagination
│
├─ /productos/[slug] (Detail)
│  ├─ Product Gallery
│  ├─ Product Info
│  ├─ Variation Selector
│  ├─ WhatsApp Button
│  └─ Related Products
│
├─ /contacto (Contact Form)
│  ├─ Contact Form (3 submits/5 min)
│  ├─ Contact Info
│  └─ Map & Hours
│
├─ /sobre-nosotros (About)
│  ├─ About Hero
│  ├─ Values Section
│  └─ Story
│
├─ /test-errors (Test)
│  └─ Error Boundary Testing
│
└─ /api/rate-limit (API)
   └─ POST - Check rate limit
```

### Acceso Público

Todas las rutas son **públicas** (sin autenticación):

```
✅ GET  /
✅ GET  /productos
✅ GET  /productos/[slug]
✅ GET  /contacto
✅ GET  /sobre-nosotros
✅ POST /api/rate-limit
```

---

## Estructura de Archivos

### app/ Directory Layout

```
app/
├── layout.tsx                    # Root layout (51 líneas)
├── page.tsx                      # Home page (51 líneas)
├── error.tsx                     # Global error boundary (si existe)
├── not-found.tsx                 # 404 custom (si existe)
│
├── globals.css                   # Tailwind + custom CSS
├── favicon.ico                   # Favicon
├── robots.ts                     # robots.txt generator
├── sitemap.ts                    # sitemap.xml generator
│
├── api/
│   └── rate-limit/
│       └── route.ts              # POST /api/rate-limit
│
├── contacto/
│   ├── layout.tsx                # Contacto layout (opcional)
│   ├── page.tsx                  # GET /contacto
│   └── error.tsx                 # Error boundary
│
├── productos/
│   ├── page.tsx                  # GET /productos (147 líneas)
│   ├── error.tsx                 # Error boundary
│   ├── loading.tsx               # Suspense fallback
│   └── [slug]/
│       ├── page.tsx              # GET /productos/[slug] (125 líneas)
│       ├── error.tsx             # Error boundary
│       └── loading.tsx           # Suspense fallback
│
├── sobre-nosotros/
│   ├── page.tsx                  # GET /sobre-nosotros
│   └── layout.tsx                # Layout (si existe)
│
└── test-errors/
    └── page.tsx                  # GET /test-errors (testing)
```

### Tamaño de Archivos

- Root layout: 51 líneas
- Home page: 51 líneas
- Products listing: 147 líneas
- Product detail: 125 líneas
- Other pages: 30-50 líneas

**Total:** ~450 líneas de código de rutas (muy limpio)

---

## Root Layout

### app/layout.tsx

```typescript
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

// Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",    // CSS var para headings
  display: "swap",               // Mostrar texto mientras carga
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",       // CSS var para body text
  display: "swap",
});

// Metadata global
export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,  // Usar para sub-páginas
  },
  description: SITE_CONFIG.description,
};

// Root layout (el wrapper de toda la app)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${inter.variable} antialiased flex flex-col min-h-screen`}>
        {/* Header persistente */}
        <Header />

        {/* Main content area (grow = flex-grow) */}
        <main className="grow pt-16">{children}</main>

        {/* Footer persistente */}
        <Footer />

        {/* Performance & Analytics */}
        <SpeedInsights />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
```

### Características Clave

#### Fonts Optimization

- **Playfair Display**: Headings (display)
- **Inter**: Body text (sans-serif)
- CSS variables para usar en Tailwind
- `display="swap"`: Muestra fallback mientras carga

#### Layout Persistente

- Header + Footer siempre visibles
- `grow` (flex-grow) = main toma espacio disponible
- Responsive: `pt-16` para espacio debajo del header

#### Analytics

- Google Analytics (gtag.js)
- Vercel Speed Insights
- Production only

#### Metadata Template

```typescript
title: {
  default: "Challaco",
  template: "%s | Challaco"
}
```

Usado en sub-páginas:

```typescript
export const metadata = { title: "Productos" };
// Resultado: "Productos | Challaco"
```

---

## Páginas por Dominio

### Home Page

**Archivo:** `app/page.tsx` (51 líneas)  
**Ruta:** `GET /`  
**Tipo:** Server Component

```typescript
/**
 * Home Page - Fira Estudio
 *
 * Estructura visual:
 * 1. Hero Section
 * 2. Texture Divider
 * 3. Featured Products
 * 4. Collections Grid
 * 5. Final CTA Section
 * 6. Progress Bar
 */

export const metadata: Metadata = buildMetadata({
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TextureDivider />
      <FeaturedProducts />
      <CollectionsGrid />
      <FinalCTASection />
      <ProgressBar />
    </>
  );
}
```

**Características:**

- ✅ Server component (sin fetch, solo composición)
- ✅ Metadata exportada
- ✅ 6 secciones de contenido
- ✅ Progress bar (client island en ProgressBar)

### Productos Page (Listing)

**Archivo:** `app/productos/page.tsx` (147 líneas)  
**Ruta:** `GET /productos?categoria={slug}&page={n}`  
**Tipo:** Server Component (Data Fetching)

```typescript
interface ProductosPageProps {
  searchParams: Promise<{
    categoria?: string;
    page?: string;
  }>;
}

// ISR: Revalidate each hour
export const revalidate = 3600;

// Dynamic metadata based on category
export async function generateMetadata({
  searchParams,
}: ProductosPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categoriaSlug = params.categoria;

  // Fetch category name for metadata
  let categoriaName = "Productos";
  if (categoriaSlug) {
    const categorias = await getCategorias();
    const categoria = categorias.find((c) => c.slug === categoriaSlug);
    if (categoria) {
      categoriaName = categoria.nombre;
    }
  }

  return buildMetadata({
    title: categoriaName,
    description: categoriaDescription,
  });
}

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const params = await searchParams;

  // Validar categoria slug
  const categoriaSlug = params.categoria?.match(/^[a-z0-9-]+$/)
    ? params.categoria
    : undefined;

  // Parse page number
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 12;

  // Fetch in parallel
  const [productosResult, categorias] = await Promise.all([
    getProductos({ categoriaSlug, page, pageSize }),
    getCategorias(),
  ]);

  return (
    <main>
      <Breadcrumbs items={breadcrumbItems} />
      <CategoryFilter categorias={categorias} categoriaActual={categoriaSlug} />
      <ProductGrid productos={productosResult.productos} />
      <Pagination
        currentPage={page}
        totalPages={productosResult.totalPages}
        categorySlug={categoriaSlug}
      />
    </main>
  );
}
```

**Características Clave:**

#### Search Params

```typescript
// URL: /productos?categoria=manteles&page=2
searchParams: {
  categoria: "manteles",
  page: "2"
}
```

**Importante:** En Next.js 16, `searchParams` es async:

```typescript
const params = await searchParams; // ✅
const params = searchParams; // ❌ Error
```

#### Dynamic Metadata

- Metadata cambia según categoria
- SEO optimizado por categoría
- Fetch dentro de generateMetadata()

#### ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 3600; // Revalidate every 60 min
```

**Sin ISR:** Página se renderiza en cada request  
**Con ISR:** Página estática, se regenera cada 3600 segundos

#### Input Validation

```typescript
// Sanitize categoria slug
const categoriaSlug = rawCategoriaSlug?.match(/^[a-z0-9-]+$/)
  ? rawCategoriaSlug
  : undefined;
```

**Protege contra:** XSS, SQL injection, path traversal

#### Parallel Fetching

```typescript
const [productosResult, categorias] = await Promise.all([
  getProductos({ categoriaSlug, page, pageSize }),
  getCategorias(),
]);
```

**Ventaja:** Ambas queries en paralelo, más rápido

### Producto Detail Page

**Archivo:** `app/productos/[slug]/page.tsx` (125 líneas)  
**Ruta:** `GET /productos/[slug]`  
**Tipo:** Server Component (Dynamic)

```typescript
interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) {
    return { title: "Producto no encontrado" };
  }

  // SEO: Metadata from producto
  const description = producto.descripcion.substring(0, 157);
  const mainImage = producto.imagenes.find((img) => img.es_principal)?.url;

  return buildMetadata({
    title: producto.nombre,
    description,
    image: mainImage ? `${SITE_CONFIG.url}${mainImage}` : undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  // 404 si no existe
  if (!producto) {
    notFound();
  }

  const productSchema = generateProductSchema(producto);
  const breadcrumbItems = [
    { name: "Productos", url: "/productos" },
    { name: producto.nombre, url: `/productos/${producto.slug}` },
  ];

  return (
    <>
      {/* JSON-LD for SEO */}
      <script {...renderJsonLd(productSchema)} />

      {/* Track product view */}
      <ProductViewTracker producto={producto} />

      <main>
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Gallery (client component) */}
          <ProductGallery imagenes={producto.imagenes} />

          <div className="space-y-8">
            {/* Product info (server) */}
            <ProductInfo producto={producto} />

            {/* Variation selector + WhatsApp (client) */}
            <ProductActions
              producto={producto}
              variaciones={producto.variaciones}
            />
          </div>
        </div>

        {/* Related products (server + data fetch) */}
        <RelatedProducts
          productoId={producto.id}
          categoriaId={producto.categoria_id}
        />
      </main>
    </>
  );
}
```

**Características:**

#### Dynamic Segments

```typescript
// File: app/productos/[slug]/page.tsx
// URL: /productos/mantel-floral
// Acceso: params.slug = "mantel-floral"
```

#### 404 Handling

```typescript
if (!producto) {
  notFound(); // Usa not-found.tsx si existe
}
```

#### JSON-LD Structured Data

```typescript
const productSchema = generateProductSchema(producto);
<script {...renderJsonLd(productSchema)} />
```

**SEO Benefits:** Mejor indexación, rich snippets en Google

#### Server + Client Composition

```typescript
<ProductGallery />           {/* Client: interactiva */}
<ProductInfo />              {/* Server: estática */}
<ProductActions />           {/* Client: interactiva */}
<RelatedProducts />          {/* Server: data fetch */}
<ProductViewTracker />       {/* Client: analytics */}
```

### Contacto Page

**Archivo:** `app/contacto/page.tsx`  
**Ruta:** `GET /contacto`  
**Tipo:** Server Component

```typescript
export const metadata: Metadata = buildMetadata({
  title: "Contacto",
  description: "Envianos tu consulta sobre nuestros productos",
});

export default function ContactoPage() {
  return (
    <main>
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact form (client, with rate limiting) */}
        <ContactForm />

        {/* Contact info (server) */}
        <ContactInfo />
      </div>
    </main>
  );
}
```

---

## Dinámicas: [slug]

### Dynamic Route Conventions

```
[slug]          → Segmento dinámico único
[...slug]       → Catch-all (múltiples segmentos)
[[...slug]]     → Optional catch-all
```

### Nuestro Caso: Productos

```
app/productos/[slug]/page.tsx

URLs generadas:
- /productos/mantel-floral
- /productos/camino-de-mesa
- /productos/cortina-moderna

params.slug = "mantel-floral"
```

### generateStaticParams (Static Generation)

Para optimizar, podríamos pre-generar todas las rutas:

```typescript
// app/productos/[slug]/page.tsx

export async function generateStaticParams() {
  const productos = await getProductos();

  return productos.map((producto) => ({
    slug: producto.slug,
  }));
}

// Pregenera: /productos/mantel-floral, /productos/camino-de-mesa, etc.
// En build time, no en request time
```

**Ventaja:** Páginas estáticas + velocidad máxima

---

## Error Handling

### File Structure

```
app/
├── error.tsx              # Global error boundary
├── not-found.tsx          # Custom 404
│
├── productos/
│   ├── error.tsx          # Error boundary para /productos
│   └── [slug]/
│       └── error.tsx      # Error boundary para /productos/[slug]
│
└── contacto/
    └── error.tsx          # Error boundary para /contacto
```

### error.tsx Pattern

```typescript
"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/errors/ErrorDisplay";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to service
    console.error("Page error:", error);
  }, [error]);

  return (
    <ErrorDisplay
      error={error}
      onRetry={reset}
    />
  );
}
```

### not-found.tsx

```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg mt-4">Página no encontrada</p>
      <Link href="/productos" className="mt-8 inline-block button">
        Volver a Productos
      </Link>
    </div>
  );
}
```

**Triggered por:**

```typescript
// En page.tsx
import { notFound } from "next/navigation";

if (!producto) {
  notFound(); // Usa not-found.tsx
}
```

---

## API Routes

### Rate Limit API

**File:** `app/api/rate-limit/route.ts`  
**Endpoint:** `POST /api/rate-limit`

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    // Check rate limit
    const result = await checkServerRateLimit(key);

    return NextResponse.json(
      {
        allowed: result.allowed,
        message: result.message,
        resetTime: result.resetTime,
      },
      { status: result.allowed ? 200 : 429 },
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

**Uso en client:**

```typescript
const response = await fetch("/api/rate-limit", {
  method: "POST",
  body: JSON.stringify({ key: "contact_form_submissions" }),
});

const { allowed, message } = await response.json();
```

### API Route Conventions

```
app/api/
├── route.ts              # GET, POST, PUT, DELETE
├── middleware.ts         # Request middleware
├── [id]/
│   └── route.ts         # Rutas dinámicas
```

**Methods:**

```typescript
export async function GET(request: Request) {}
export async function POST(request: Request) {}
export async function PUT(request: Request) {}
export async function PATCH(request: Request) {}
export async function DELETE(request: Request) {}
export async function HEAD(request: Request) {}
export async function OPTIONS(request: Request) {}
```

---

## SEO & Metadata

### Metadata API

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página",
  description: "Descripción",
  keywords: ["keyword1", "keyword2"],
  openGraph: {
    title: "OG Title",
    description: "OG Description",
    url: "https://example.com",
    siteName: "Challaco",
    images: [
      {
        url: "https://example.com/image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twitter Title",
    description: "Twitter Description",
  },
};
```

### Dynamic Metadata

```typescript
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const producto = await getProductoBySlug(params.slug);

  if (!producto) {
    return { title: "Not Found" };
  }

  return {
    title: producto.nombre,
    description: producto.descripcion,
    openGraph: {
      images: [
        {
          url: producto.imagenes[0]?.url,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
```

### buildMetadata Helper

```typescript
// lib/seo/metadata.ts
export function buildMetadata({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: url || SITE_CONFIG.url,
      images: image ? [{ url: image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
```

### Structured Data (JSON-LD)

```typescript
// Producto schema
<script {...renderJsonLd(productSchema)} />

// Breadcrumb schema
<Breadcrumbs items={breadcrumbItems} />  // Incluye schema
```

---

## Performance (ISR & Revalidation)

### ISR Configuration

```typescript
// app/productos/page.tsx
export const revalidate = 3600; // Revalidate every 60 minutes
```

**Flujo:**

1. **Build time:** Página se genera estáticamente
2. **Request:** Sirve página estática rápidamente
3. **Background:** Después de 3600s, regenera en background
4. **Fallback:** Mientras regenera, sirve página anterior

**Ventajas:**

- ✅ Velocidad de página estática
- ✅ Contenido actualizado regularmente
- ✅ Sin recarga en cada request

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Revalidate all product pages
  revalidatePath("/productos", "page");

  // O revalidate specific path
  revalidatePath("/productos/mantel-floral", "page");

  // O por tag
  revalidateTag("productos");

  return NextResponse.json({ revalidated: true });
}
```

**Uso:** Llamar desde admin cuando se actualiza un producto

---

## Archivo de Configuración: robots.ts

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: "https://challaco.com/sitemap.xml",
  };
}
```

---

## Archivo de Configuración: sitemap.ts

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getProductos, getCategorias } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: "https://challaco.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://challaco.com/productos",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://challaco.com/contacto",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic product routes
  const productos = await getProductos();
  const productRoutes: MetadataRoute.Sitemap = productos.map((producto) => ({
    url: `https://challaco.com/productos/${producto.slug}`,
    lastModified: producto.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
```

---

## Best Practices

### ✅ Do's

- ✅ Usar Server Components por defecto
- ✅ Validar y sanitizar input (searchParams, params)
- ✅ Parallel fetching con Promise.all()
- ✅ ISR para páginas con contenido dinámico
- ✅ Metadata exportada en cada página
- ✅ Error boundaries en rutas importantes
- ✅ JSON-LD para SEO
- ✅ 404 handling con notFound()

### ❌ Don'ts

- ❌ Usar `await searchParams` sin `await` en page/layout
- ❌ N+1 queries (fetch en loop)
- ❌ Hardcoded URLs (usar SITE_CONFIG)
- ❌ No validar entrada (XSS risk)
- ❌ Página sin metadata
- ❌ Ignorar error boundaries
- ❌ Página lenta sin ISR/revalidation

---

## Debugging Routes

### Enable Debug Logging

```typescript
// next.config.ts
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

### Check Build Output

```bash
npm run build

# Verá:
# ○ (Static)    /
# ○ (ISR)       /productos [3600s]
# ● (Dynamic)   /productos/[slug]
```

### Test Routes

```bash
npm run dev

# Visitar:
http://localhost:3000/
http://localhost:3000/productos
http://localhost:3000/productos/mantel-floral?categoria=manteles&page=2
http://localhost:3000/contacto
```

---

## Recursos Adicionales

### Documentos Relacionados

- [Components Onboarding](./COMPONENTS.md)
- [Configuration & Standards](./CONFIGURATION.md)
- [Project Structure](./PROJECT_STRUCTURE.md)

### Links Útiles

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Caching & Revalidation](https://nextjs.org/docs/app/building-your-application/caching)

---

**Última actualización:** 29 de enero de 2026  
**Mantenido por:** Equipo de desarrollo Challaco
