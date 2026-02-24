---
applyTo: "components/**,app/**"
---

# Componentes — Patrones del proyecto

## Server vs Client Component

```ts
// ✅ Server Component por defecto (sin directiva)
export default async function ProductosPage() {
  const productos = await getProductos();
  return <ProductGrid productos={productos} />;
}

// ✅ Client Component solo cuando es necesario
"use client";
export function VariationSelector({ variaciones }: { variaciones: Variacion[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  // ...
}
```

Usar `"use client"` solo para: hooks de estado/efecto, event handlers, browser APIs.

## Contenido y estilos: siempre centralizados

```ts
// ✅
import { HOME_CONTENT } from "@/lib/content/home";
import { TYPOGRAPHY, SPACING } from "@/lib/design/tokens";

export function HeroSection() {
  return (
    <section className={SPACING.sectionPadding.md}>
      <h1 className={TYPOGRAPHY.heading.page}>{HOME_CONTENT.hero.title}</h1>
    </section>
  );
}

// ❌ Nunca hardcodear texto o clases repetidas
<h1 className="text-4xl font-bold">Fira Estudio</h1>
```

## Composición sobre monolitos

```ts
// ✅ Componentes pequeños y enfocados
export function ProductCard({ producto }: { producto: ProductoCompleto }) {
  return (
    <article>
      <ProductImage producto={producto} />
      <ProductInfo producto={producto} />
      <ProductActions producto={producto} />
    </article>
  );
}
// ❌ Un componente con 200+ líneas mezclando UI, lógica y fetching
```

## Loading states

```ts
// Opción 1: Suspense
<Suspense fallback={<ProductosSkeleton />}>
  <ProductosContent />
</Suspense>

// Opción 2: app/productos/loading.tsx (App Router)
export default function Loading() {
  return <ProductosSkeleton />;
}
```

Los skeletons deben coincidir con el layout final (evitar layout shift).

## Server Actions vs API Routes

- **Preferir Server Actions** para mutaciones internas
- **API Routes** solo para webhooks (Mercado Pago) e integraciones externas

## Variaciones: reglas de UI

- Nunca mostrar precio del producto base; solo precio de la variación seleccionada
- WhatsApp CTA deshabilitado hasta que haya variación seleccionada
- `stock = 0` → mostrar "A pedido", no ocultar ni deshabilitar