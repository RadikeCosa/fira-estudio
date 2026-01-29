# Components Architecture - Onboarding Guide

**Última actualización:** 29 de enero de 2026  
**Versión:** Next.js 16 (App Router)  
**Arquitectura:** Server Components por defecto, Client Components cuando es necesario

---

## Índice

1. [Estructura de Carpetas](#estructura-de-carpetas)
2. [Convenciones y Patrones](#convenciones-y-patrones)
3. [Server vs Client Components](#server-vs-client-components)
4. [Sistema de Diseño](#sistema-de-diseño)
5. [Componentes por Dominio](#componentes-por-dominio)
6. [Testing Patterns](#testing-patterns)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Estructura de Carpetas

```
components/
├── layout/              # Componentes de estructura de página
│   ├── Header.tsx       # Navegación principal
│   ├── Footer.tsx       # Footer del sitio
│   ├── MobileNav.tsx    # Menú hamburguesa mobile (client)
│   └── ProgressBar.tsx  # Barra de progreso de scroll (client)
│
├── ui/                  # Componentes primitivos reutilizables
│   ├── Button.tsx       # Botón base con variantes
│   ├── Card.tsx         # Contenedor con border/shadow
│   ├── Input.tsx        # Input con validación
│   ├── Textarea.tsx     # Textarea con validación
│   ├── Badge.tsx        # Badge/tag visual
│   ├── Breadcrumbs.tsx  # Navegación breadcrumb
│   └── Carousel.tsx     # Carrusel de imágenes (client)
│
├── productos/           # Dominio: Productos y variaciones
│   ├── ProductCard.tsx           # Tarjeta en listings (server)
│   ├── ProductGrid.tsx           # Grid de productos (server)
│   ├── ProductGallery.tsx        # Galería de imágenes (client)
│   ├── ProductInfo.tsx           # Info del producto (server)
│   ├── ProductActions.tsx        # Selector + WhatsApp (client)
│   ├── VariationSelector.tsx     # Selector tamaño/color (client)
│   ├── WhatsAppButton.tsx        # Botón de consulta (client)
│   ├── StockBadge.tsx           # Badge de stock (server)
│   ├── CategoryFilter.tsx        # Filtro de categorías (client)
│   ├── Pagination.tsx           # Paginación (server)
│   ├── RelatedProducts.tsx      # Productos relacionados (server)
│   └── ProductViewTracker.tsx   # Analytics tracking (client)
│
├── home/                # Dominio: Página de inicio
│   ├── HeroSection.tsx          # Hero principal (server)
│   ├── FeaturedProducts.tsx     # Productos destacados (server)
│   ├── FeaturedProductsSection.tsx # Sección completa (server)
│   ├── CategoriesSection.tsx    # Grid de categorías (server)
│   ├── CollectionsGrid.tsx      # Colecciones (server)
│   ├── FinalCTASection.tsx      # CTA final (server)
│   └── TextureDivider.tsx       # Divisor visual (server)
│
├── contacto/            # Dominio: Contacto
│   ├── ContactForm.tsx          # Formulario principal (client)
│   ├── ContactFormFields.tsx    # Campos del form (client)
│   ├── ContactFormActions.tsx   # Botones/mensajes (client)
│   └── ContactInfo.tsx          # Info de contacto (server)
│
├── sobre-nosotros/      # Dominio: About
│   ├── AboutHero.tsx            # Hero de about (server)
│   ├── ValueCard.tsx            # Tarjeta de valores (server)
│   └── StorySection.tsx         # Historia (server)
│
└── errors/              # Componentes de error
    ├── ErrorDisplay.tsx         # Display de errores (client)
    ├── NotFoundError.tsx        # 404 custom (server)
    └── index.ts                 # Barrel export
```

---

## Convenciones y Patrones

### 1. Nomenclatura

- **PascalCase** para nombres de archivo y componente
- **Nombres descriptivos**: `ProductCard` > `Card`, `MobileNav` > `Nav`
- **Sufijos específicos**: `Section`, `Grid`, `Card`, `Button`, `Form`, `Tracker`

### 2. Organización por Dominio

Los componentes se organizan por **dominio de negocio**, no por tipo técnico:

✅ **Correcto:**
```
productos/ProductCard.tsx
productos/ProductGrid.tsx
contacto/ContactForm.tsx
```

❌ **Incorrecto:**
```
cards/ProductCard.tsx
forms/ContactForm.tsx
grids/ProductGrid.tsx
```

**Excepción:** `ui/` contiene primitivos reutilizables sin lógica de negocio.

### 3. Barrel Exports

Usar `index.ts` solo cuando hay múltiples componentes relacionados:

```typescript
// components/errors/index.ts
export { ErrorDisplay } from "./ErrorDisplay";
export { NotFoundError } from "./NotFoundError";
```

### 4. Props Interface

Siempre definir interface explícita para props:

```typescript
interface ProductCardProps {
  producto: Producto;
  imagenPrincipal?: string;
  imagenAlt?: string | null;
}

export function ProductCard({ producto, imagenPrincipal, imagenAlt }: ProductCardProps) {
  // ...
}
```

---

## Server vs Client Components

### Server Components (Por Defecto)

**Usar cuando:**
- No hay interactividad del usuario
- Se puede renderizar en el servidor
- Se accede a datos directamente
- No se usan hooks de React (useState, useEffect, etc.)

**Ejemplos:**
```typescript
// components/productos/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";

export function ProductCard({ producto }: ProductCardProps) {
  // No necesita 'use client'
  return <Link href={`/productos/${producto.slug}`}>...</Link>;
}
```

```typescript
// components/home/HeroSection.tsx
import { HERO_CONTENT } from "@/lib/content/hero";

export function HeroSection() {
  // Server component - acceso directo a constantes
  return <section>{HERO_CONTENT.title}</section>;
}
```

### Client Components

**Usar cuando:**
- Se necesita interactividad (onClick, onChange, etc.)
- Se usan hooks: useState, useEffect, useRef, etc.
- Se usan browser APIs: window, localStorage, etc.
- Se requiere context de React

**Ejemplos:**
```typescript
// components/layout/MobileNav.tsx
"use client";

import { useState } from "react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  // Necesita 'use client' por useState
}
```

```typescript
// components/productos/ProductActions.tsx
"use client";

import { useState, useEffect } from "react";
import { trackVariationSelect } from "@/lib/analytics/gtag";

export function ProductActions({ producto, variaciones }: ProductActionsProps) {
  const [variacionSeleccionada, setVariacionSeleccionada] = useState<Variacion | null>(null);
  
  useEffect(() => {
    if (variacionSeleccionada) {
      trackVariationSelect(producto, variacionSeleccionada);
    }
  }, [variacionSeleccionada, producto]);
  
  // Client component por useState + useEffect + analytics
}
```

### Patrón: Server Component con Client Island

**Estrategia:** Maximizar server components, usar client solo donde es necesario.

```typescript
// app/productos/[slug]/page.tsx (Server Component)
import { ProductGallery } from "@/components/productos/ProductGallery";
import { ProductInfo } from "@/components/productos/ProductInfo";
import { ProductActions } from "@/components/productos/ProductActions"; // Client

export default async function ProductPage({ params }: ProductPageProps) {
  const producto = await getProductoBySlug(params.slug);
  
  return (
    <main>
      {/* Server components */}
      <ProductInfo producto={producto} />
      
      {/* Client component island */}
      <ProductActions producto={producto} variaciones={producto.variaciones} />
    </main>
  );
}
```

---

## Sistema de Diseño

### Design Tokens

Todos los estilos usan tokens centralizados de `lib/design/tokens.ts`:

```typescript
import { COLORS, TYPOGRAPHY, SPACING, COMPONENTS } from "@/lib/design/tokens";

// Uso en componente
<div className={COLORS.text.primary}>
  <p className={TYPOGRAPHY.heading.h2}>Título</p>
</div>
```

**Tokens disponibles:**

#### COLORS
```typescript
COLORS.text.primary        // text-foreground
COLORS.text.secondary      // text-muted-foreground
COLORS.background.primary  // bg-white
COLORS.border.default      // border-border
COLORS.border.hover        // border-foreground/30
```

#### TYPOGRAPHY
```typescript
TYPOGRAPHY.heading.h1    // text-4xl md:text-5xl lg:text-6xl font-bold
TYPOGRAPHY.heading.h2    // text-3xl md:text-4xl lg:text-5xl font-bold
TYPOGRAPHY.body.large    // text-lg text-muted-foreground
```

#### SPACING
```typescript
SPACING.section.sm       // py-8 md:py-12
SPACING.section.md       // py-12 md:py-16 lg:py-20
SPACING.container        // container max-w-7xl mx-auto px-4
```

#### COMPONENTS (Específicos)
```typescript
COMPONENTS.button.base   // Estilos base de botón
COMPONENTS.card.base     // Estilos base de card
COMPONENTS.error.text    // text-red-600 (para errores)
```

### UI Primitives

Componentes base en `components/ui/`:

#### Button
```typescript
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="lg" onClick={handleClick}>
  Enviar
</Button>
```

Variantes: `primary`, `secondary`, `outline`, `ghost`  
Tamaños: `sm`, `md`, `lg`

#### Card
```typescript
import { Card } from "@/components/ui/Card";

<Card hover={true}>
  <h3>Título</h3>
  <p>Contenido</p>
</Card>
```

Props: `hover` (boolean), `className` (string)

#### Input/Textarea
```typescript
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

<Input
  id="nombre"
  label="Nombre completo"
  type="text"
  error="Campo requerido"
  required
/>

<Textarea
  id="mensaje"
  label="Tu mensaje"
  rows={5}
  error="Mínimo 20 caracteres"
/>
```

Props compartidas: `label`, `error`, `required`, `disabled`

---

## Componentes por Dominio

### Layout (Estructura de Página)

#### Header
**Tipo:** Server Component  
**Ubicación:** `components/layout/Header.tsx`  
**Propósito:** Navegación principal del sitio

```typescript
import { Header } from "@/components/layout/Header";

// Usado en app/layout.tsx
<Header />
```

**Características:**
- Logo + navegación desktop
- MobileNav integrado (client island)
- Links: Inicio, Productos, Sobre Nosotros, Contacto

#### MobileNav
**Tipo:** Client Component  
**Ubicación:** `components/layout/MobileNav.tsx`  
**Propósito:** Menú hamburguesa responsive

```typescript
"use client";
import { MobileNav } from "@/components/layout/MobileNav";
```

**Características:**
- useState para open/close
- useScrollLock hook (bloquea scroll cuando abierto)
- useEscapeKey hook (cierra con ESC)
- Animaciones de entrada/salida
- Z-index layering: button(60), menu(50), overlay(40)

#### Footer
**Tipo:** Server Component  
**Ubicación:** `components/layout/Footer.tsx`

**Características:**
- Links de navegación
- Redes sociales
- Copyright

### Productos (Dominio Principal)

#### ProductCard
**Tipo:** Server Component  
**Ubicación:** `components/productos/ProductCard.tsx`  
**Propósito:** Tarjeta de producto en listings

```typescript
import { ProductCard } from "@/components/productos/ProductCard";

<ProductCard 
  producto={producto}
  imagenPrincipal={imagen.url}
  imagenAlt={imagen.alt_text}
/>
```

**Props:**
- `producto: Producto` - Objeto producto completo
- `imagenPrincipal?: string` - URL de imagen principal
- `imagenAlt?: string | null` - Texto alternativo

**Características:**
- Badge "Destacado" si `producto.destacado === true`
- Precio con formato "Desde $X" si múltiples variaciones
- Hover effects (scale, shadow, translate)
- Image optimization con Next.js Image
- Link a `/productos/${slug}`

#### ProductGrid
**Tipo:** Server Component  
**Ubicación:** `components/productos/ProductGrid.tsx`

```typescript
<ProductGrid productos={productos} />
```

**Características:**
- Grid responsive: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Maneja productos vacíos con mensaje
- Extrae imagen principal automáticamente

#### ProductGallery
**Tipo:** Client Component  
**Ubicación:** `components/productos/ProductGallery.tsx`  
**Propósito:** Galería de imágenes con thumbnails

```typescript
"use client";

<ProductGallery imagenes={producto.imagenes} />
```

**Características:**
- useState para imagen seleccionada
- Thumbnails clickeables
- Indicadores activos
- Responsive layout

#### ProductActions
**Tipo:** Client Component (Wrapper)  
**Ubicación:** `components/productos/ProductActions.tsx`  
**Propósito:** Conecta VariationSelector con WhatsAppButton

```typescript
"use client";

<ProductActions producto={producto} variaciones={variaciones} />
```

**Características:**
- useState para variación seleccionada
- useEffect para tracking de analytics
- Pasa variación a WhatsAppButton
- Container con border y shadow

#### VariationSelector
**Tipo:** Client Component  
**Ubicación:** `components/productos/VariationSelector.tsx`  
**Propósito:** Selector de tamaño y color

```typescript
"use client";

interface VariationSelectorProps {
  variaciones: Variacion[];
  onVariacionChange: (variacion: Variacion | null) => void;
}

<VariationSelector 
  variaciones={variaciones}
  onVariacionChange={setVariacionSeleccionada}
/>
```

**Características:**
- Inicializa con primera variación activa
- Selects enlazados: tamaño → color
- Reset de color cuando cambia tamaño
- Muestra precio y stock de variación seleccionada
- Tooltip para productos a pedido (stock = 0)
- Utilities: `getUniqueSizes()`, `getColorsForSize()`, `findVariation()`

#### WhatsAppButton
**Tipo:** Client Component  
**Ubicación:** `components/productos/WhatsAppButton.tsx`

```typescript
"use client";

<WhatsAppButton producto={producto} variacion={variacionSeleccionada} />
```

**Características:**
- Construye mensaje formateado para WhatsApp
- Incluye nombre, tamaño, color, precio
- Analytics tracking (trackWhatsAppClick)
- Disabled si no hay variación seleccionada
- Abre en nueva pestaña

#### StockBadge
**Tipo:** Server Component  
**Ubicación:** `components/productos/StockBadge.tsx`

```typescript
<StockBadge variacion={variacion} />
```

**Características:**
- `stock > 5`: "En stock" (verde)
- `stock 1-5`: "Últimas unidades" (amarillo)
- `stock = 0`: "A pedido" (azul)

#### CategoryFilter
**Tipo:** Client Component  
**Ubicación:** `components/productos/CategoryFilter.tsx`

```typescript
"use client";

<CategoryFilter 
  categorias={categorias}
  categoriaActual={categoriaSlug}
/>
```

**Características:**
- Links con searchParams
- Tracking de analytics
- Badge con contador de productos
- Botón "Todos" para reset

#### ProductViewTracker
**Tipo:** Client Component  
**Ubicación:** `components/productos/ProductViewTracker.tsx`  
**Propósito:** Analytics tracking invisible

```typescript
"use client";

<ProductViewTracker producto={producto} />
```

**Características:**
- Invisible (returns null)
- useEffect para trackProductView
- Se ejecuta solo en production con gtag

### Home (Página de Inicio)

#### HeroSection
**Tipo:** Server Component  
**Ubicación:** `components/home/HeroSection.tsx`

```typescript
<HeroSection />
```

**Características:**
- Usa `HERO_CONTENT` de lib/content
- CTA principal a /productos
- Hero image con gradiente
- Responsive typography

#### FeaturedProductsSection
**Tipo:** Server Component  
**Ubicación:** `components/home/FeaturedProductsSection.tsx`

```typescript
<FeaturedProductsSection productos={productosDestacados} />
```

**Características:**
- Título de sección
- FeaturedProducts grid
- Link a /productos
- TextureDivider decorativo

### Contacto

#### ContactForm
**Tipo:** Client Component  
**Ubicación:** `components/contacto/ContactForm.tsx`  
**Refactorizado:** Fix 4 (290 → 217 líneas)

```typescript
"use client";

<ContactForm />
```

**Características:**
- Validación con lib/utils/validation
- Rate limiting (3 mensajes / 5 min)
- XSS protection
- Honeypot anti-bot
- Sanitización de inputs
- Abre WhatsApp con mensaje formateado

**Arquitectura (3 componentes):**

1. **ContactForm** - Lógica principal
   - useState para errores, submitting
   - useRateLimit hook
   - Validación y sanitización
   - Manejo de submit

2. **ContactFormFields** - Renderizado de campos
   ```typescript
   <ContactFormFields
     form={form}
     errors={errors}
     disabled={isSubmitting || isRateLimited}
     nombreRef={nombreRef}
     emailRef={emailRef}
     telefonoRef={telefonoRef}
     mensajeRef={mensajeRef}
   />
   ```

3. **ContactFormActions** - Botón y mensajes
   ```typescript
   <ContactFormActions
     buttonText={getButtonText()}
     disabled={isSubmitting || isRateLimited}
     rateLimitMessage={rateLimitMessage}
     isRateLimited={isRateLimited}
     submitHelperText={form.submitHelperText}
   />
   ```

#### ContactInfo
**Tipo:** Server Component  
**Ubicación:** `components/contacto/ContactInfo.tsx`

```typescript
<ContactInfo />
```

**Características:**
- Email, WhatsApp, Instagram
- Horarios de atención
- Carrusel de imágenes

### UI Components (Primitivos)

#### Badge
```typescript
<Badge variant="success">En stock</Badge>
<Badge variant="warning">Últimas unidades</Badge>
<Badge variant="info">A pedido</Badge>
```

#### Breadcrumbs
```typescript
<Breadcrumbs items={[
  { name: "Productos", url: "/productos" },
  { name: "Mantel Floral", url: "/productos/mantel-floral" }
]} />
```

#### Carousel (Client Component)
```typescript
"use client";

<Carousel images={images} autoPlay={true} interval={5000} />
```

---

## Testing Patterns

### Ubicación de Tests

Los tests se ubican **junto al componente** con extensión `.test.tsx`:

```
components/
├── productos/
│   ├── ProductCard.tsx
│   ├── ProductCard.test.tsx      ✅
│   ├── VariationSelector.tsx
│   └── VariationSelector.test.tsx (pendiente)
```

### Estructura de Test

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  beforeEach(() => {
    // Setup antes de cada test
    vi.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    render(<ComponentName prop1="value" />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interaction", () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking Dependencies

#### Mocking Módulos
```typescript
// Mock analytics
vi.mock("@/lib/analytics/gtag", () => ({
  trackProductView: vi.fn(),
  trackVariationSelect: vi.fn(),
}));

// Mock server functions
vi.mock("@/lib/utils/rate-limit-server", () => ({
  checkServerRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));
```

#### Mocking Next.js
```typescript
// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));
```

### Tests Actuales

| Componente | Tests | Cobertura |
|------------|-------|-----------|
| ProductCard | 10 | ✅ Completa |
| ContactForm | 14 | ✅ Completa |
| MobileNav | 3 | ✅ Z-index |
| ProductViewTracker | 3 | ✅ Completa |
| Header | 2 | ⚠️ Básica |
| StockBadge | 4 | ✅ Completa |
| WhatsAppButton | 3 | ✅ Completa |
| RelatedProducts | 2 | ⚠️ Básica |
| CategoryFilter | 3 | ✅ Completa |

**Pendientes (Priority):**
- VariationSelector (alto - lógica compleja)
- ProductGallery (medio - estado de UI)
- Carousel (medio - cliente)

---

## Ejemplos de Uso

### Ejemplo 1: Crear Nuevo Componente de Dominio

**Escenario:** Crear componente para mostrar reseñas de productos

```typescript
// components/productos/ProductReviews.tsx
"use client"; // Necesita interactividad (expand/collapse)

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Review {
  id: string;
  autor: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

interface ProductReviewsProps {
  reviews: Review[];
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Reseñas</h3>
      {reviews.map((review) => (
        <Card key={review.id} hover={false}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{review.autor}</p>
              <Badge variant="success">{review.calificacion}⭐</Badge>
            </div>
            <span className="text-sm text-muted-foreground">{review.fecha}</span>
          </div>
          
          <p className={expandedId === review.id ? "" : "line-clamp-3"}>
            {review.comentario}
          </p>
          
          <button onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}>
            {expandedId === review.id ? "Ver menos" : "Ver más"}
          </button>
        </Card>
      ))}
    </div>
  );
}
```

**Test correspondiente:**
```typescript
// components/productos/ProductReviews.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductReviews } from "./ProductReviews";

const mockReviews = [
  { id: "1", autor: "Juan", calificacion: 5, comentario: "Excelente producto", fecha: "2026-01-15" }
];

describe("ProductReviews", () => {
  it("renders all reviews", () => {
    render(<ProductReviews reviews={mockReviews} />);
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("5⭐")).toBeInTheDocument();
  });

  it("expands review on click", () => {
    render(<ProductReviews reviews={mockReviews} />);
    const button = screen.getByText("Ver más");
    fireEvent.click(button);
    expect(screen.getByText("Ver menos")).toBeInTheDocument();
  });
});
```

### Ejemplo 2: Composición de Componentes

**Escenario:** Página de producto usa múltiples componentes

```typescript
// app/productos/[slug]/page.tsx (Server Component)
import { getProductoBySlug } from "@/lib/supabase/queries";
import { ProductGallery } from "@/components/productos/ProductGallery";
import { ProductInfo } from "@/components/productos/ProductInfo";
import { ProductActions } from "@/components/productos/ProductActions";
import { ProductViewTracker } from "@/components/productos/ProductViewTracker";
import { RelatedProducts } from "@/components/productos/RelatedProducts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const producto = await getProductoBySlug(params.slug);
  
  if (!producto) notFound();

  return (
    <main>
      {/* Analytics (client, invisible) */}
      <ProductViewTracker producto={producto} />

      <div className="container">
        {/* Breadcrumbs (server) */}
        <Breadcrumbs items={[
          { name: "Productos", url: "/productos" },
          { name: producto.nombre, url: `/productos/${producto.slug}` }
        ]} />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Galería (client - interactiva) */}
          <ProductGallery imagenes={producto.imagenes} />

          <div className="space-y-8">
            {/* Info (server - estática) */}
            <ProductInfo producto={producto} />

            {/* Actions (client - interactividad) */}
            <ProductActions 
              producto={producto}
              variaciones={producto.variaciones}
            />
          </div>
        </div>

        {/* Related (server - data fetching) */}
        <RelatedProducts 
          productoId={producto.id}
          categoriaId={producto.categoria_id}
        />
      </div>
    </main>
  );
}
```

**Observaciones:**
- Server component principal
- Data fetching con async/await
- Client islands donde se necesita interactividad
- Server components para contenido estático
- Analytics invisible

### Ejemplo 3: Usar Design Tokens

```typescript
// components/productos/ProductHighlight.tsx
import { COLORS, TYPOGRAPHY, SPACING, COMPONENTS } from "@/lib/design/tokens";

export function ProductHighlight({ producto }: { producto: Producto }) {
  return (
    <section className={SPACING.section.md}>
      <div className={SPACING.container}>
        <h2 className={TYPOGRAPHY.heading.h2}>
          {producto.nombre}
        </h2>
        
        <div className={`
          ${COMPONENTS.card.base}
          ${COLORS.background.primary}
          ${COLORS.border.default}
        `}>
          <p className={COLORS.text.secondary}>
            {producto.descripcion}
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## Recursos Adicionales

### Documentos Relacionados
- [Project Structure](./PROJECT_STRUCTURE.md) - Arquitectura completa
- [Data & Queries](./DATA_AND_QUERIES.md) - Supabase y queries
- [Phase 1 Complete](../PHASE_1_COMPLETE.md) - Fixes recientes

### Utilidades Importantes
- `lib/utils/image.ts` - Image URL y alt text helpers
- `lib/utils/variations.ts` - Lógica de variaciones
- `lib/utils/validation.ts` - Validación de formularios
- `lib/design/tokens.ts` - Design system tokens
- `lib/content/` - Contenido centralizado

### Hooks Personalizados
- `hooks/useScrollLock.ts` - Bloquea scroll (modales)
- `hooks/useEscapeKey.ts` - Maneja tecla ESC
- `hooks/useRateLimit.ts` - Rate limiting client-side

### Testing
- Framework: Vitest + React Testing Library
- Ejecutar tests: `npm test`
- Coverage: `npm run test:coverage`
- Configuración: `vitest.config.ts`

---

## Checklist para Nuevos Componentes

Antes de crear un nuevo componente, verificá:

- [ ] ¿Es reutilizable? → `components/ui/`
- [ ] ¿Es específico de dominio? → `components/{dominio}/`
- [ ] ¿Necesita interactividad? → `"use client"`
- [ ] ¿Server component por defecto? → Sin `"use client"`
- [ ] Interface de props definida
- [ ] Usa design tokens (no hardcoded styles)
- [ ] Usa utilidades existentes (image, format, etc.)
- [ ] JSDoc comments para funciones
- [ ] Test file creado (`.test.tsx`)
- [ ] Exportado desde index si es parte de grupo

---

**Última actualización:** 29 de enero de 2026  
**Mantenido por:** Equipo de desarrollo Challaco
