# Estándar de Metadata Centralizada

## Objetivo

Unificar la generación de metadata para SEO y redes sociales en todas las páginas del proyecto, usando la utilidad `buildMetadata` en `lib/seo/metadata.ts`.

## Beneficios

- Consistencia en los campos de metadata
- Mejor SEO y social sharing
- Mantenimiento más sencillo
- Uso centralizado de SITE_CONFIG

---

## 🔧 buildMetadata Signature

```typescript
interface MetadataInput {
  title: string; // Título de la página (max 60 chars recomendado)
  description: string; // Meta description (max 160 chars)
  image?: string; // URL de imagen (absoluta o relativa)
  url?: string; // URL canónica (absoluta)
  type?: "website" | "article" | "product"; // OpenGraph type
  author?: string; // Autor del contenido
  publishedTime?: Date; // Fecha de publicación (para articles)
  updatedTime?: Date; // Fecha de actualización
  canonicalUrl?: string; // URL canónica explícita
  robots?: "index, follow" | "noindex, nofollow";
  keywords?: string[]; // Palabras clave (separadas por comas en meta)
}

export function buildMetadata(input: MetadataInput): Metadata;
```

---

## 📖 Uso en Páginas Estáticas

```typescript
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Contacto",
  description: `Contactate con ${SITE_CONFIG.name}. Envianos tu consulta y te responderemos a la brevedad.`,
  url: `${SITE_CONFIG.url}/contacto`,
  type: "website",
});

export default function ContactoPage() {
  return (
    // ... page content
  );
}
```

---

## 🔗 Uso en Páginas Dinámicas

```typescript
import { buildMetadata } from "@/lib/seo/metadata";
import { getProductoBySlug } from "@/lib/supabase/queries";
import { SITE_CONFIG } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const producto = await getProductoBySlug(params.slug);

  if (!producto) {
    return buildMetadata({
      title: "Producto no encontrado",
      description: "El producto que buscas no existe.",
      robots: "noindex, nofollow",
    });
  }

  return buildMetadata({
    title: producto.nombre,
    description: producto.descripcion || `Descubre ${producto.nombre} en ${SITE_CONFIG.name}`,
    image: producto.imagen_destacada?.url || `${SITE_CONFIG.url}/default-product.jpg`,
    url: `${SITE_CONFIG.url}/productos/${producto.slug}`,
    type: "product",
    keywords: [producto.nombre, producto.categoria?.nombre, "textiles", "artesanal"],
  });
}

export default async function ProductPage({ params }) {
  const producto = await getProductoBySlug(params.slug);
  return (
    // ... page content
  );
}
```

---

## 📸 Image Handling

### Resolución de URLs

```typescript
// ❌ INCORRECTO - URL relativa sin dominio
{
  image: "/images/producto.jpg",  // OpenGraph necesita URL absoluta
}

// ✅ CORRECTO - URL absoluta
{
  image: `${SITE_CONFIG.url}/images/producto.jpg`,
}

// ✅ CORRECTO - URL de CDN externa
{
  image: "https://cdn.example.com/images/producto.jpg",
}

// ✅ CORRECTO - URL de Supabase Storage
{
  image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos/${producto.id}/main.jpg`,
}
```

### Social Preview Dimensions

```typescript
// Recomendaciones de tamaño para diferentes plataformas

// OpenGraph (Facebook, LinkedIn, etc.)
// Min: 1200x630px (aspect ratio 1.91:1)
// Recomendado: 1200x630px

// Twitter Card
// Min: 506x506px
// Recomendado: 1024x512px (2:1 ratio)

// WhatsApp / Telegram
// Min: 500x500px
// Recomendado: 1200x630px (flexible)
```

---

## 🎯 OpenGraph Types

```typescript
// 'website' - Para páginas generales
{
  type: 'website',
  // Usado para: home, about, contact
}

// 'article' - Para blog posts, noticias
{
  type: 'article',
  publishedTime: new Date('2026-01-29'),
  updatedTime: new Date('2026-01-29'),
  author: "Fira Estudio",
  // Usado para: blog posts
}

// 'product' - Para páginas de productos
{
  type: 'product',
  // Usado para: /productos/[slug]
}
```

---

## 🏷️ JSON-LD Structured Data

### Product Schema

```typescript
// Ejemplo: Página de producto
export async function generateMetadata({ params }) {
  const producto = await getProductoBySlug(params.slug);

  const metadata = buildMetadata({
    title: producto.nombre,
    description: producto.descripcion,
    image: producto.imagen_destacada?.url,
    url: `${SITE_CONFIG.url}/productos/${producto.slug}`,
    type: "product",
  });

  // Agregar a la página como <script type="application/ld+json">
  return {
    ...metadata,
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: producto.nombre,
        description: producto.descripcion,
        image: producto.imagen_destacada?.url,
        url: `${SITE_CONFIG.url}/productos/${producto.slug}`,
        brand: {
          "@type": "Brand",
          name: SITE_CONFIG.name,
        },
        offers: {
          "@type": "AggregateOffer",
          lowPrice: producto.precio_desde,
          highPrice: Math.max(...producto.variaciones.map((v) => v.precio)),
          priceCurrency: "ARS",
          availability: "https://schema.org/InStock",
        },
      }),
    },
  };
}
```

### Organization Schema

```typescript
// app/layout.tsx
{
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: `${SITE_CONFIG.url}/logo.png`,
      sameAs: [
        "https://www.instagram.com/firaestu",
        "https://wa.me/549123456789",
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "AR",
        addressLocality: "Ciudad",
      },
    }),
  },
}
```

---

## 🔍 SEO Checklist

### On-Page Fundamentals

- [ ] Title entre 50-60 caracteres
- [ ] Description entre 150-160 caracteres
- [ ] H1 único por página (evitar duplicados)
- [ ] Keywords en: title, H1, primeros párrafos
- [ ] Internal links con anchor text descriptivo
- [ ] Meta robots configurados correctamente

### Social Sharing

- [ ] OpenGraph title = page title o variante concisa
- [ ] OpenGraph description = meta description
- [ ] og:image 1200x630px minimum
- [ ] og:url = URL canónica
- [ ] og:site_name = SITE_CONFIG.name

### Technical SEO

- [ ] URL canónica (avoid duplicates)
- [ ] Hreflang para múltiples idiomas (si aplica)
- [ ] robots.txt configurado
- [ ] Sitemap generado
- [ ] Schema.org markup para productos
- [ ] Mobile-friendly

### Performance Metrics

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Page size < 3MB
- [ ] Images optimized

---

## 🛠️ Validación de Metadata

### CLI Tool (opcional)

```bash
# Verificar metadata de URL
npx next-seo check https://firaestu.com/productos/mantel-floral

# Output:
# ✅ Title length: 52 chars (OK)
# ✅ Description length: 158 chars (OK)
# ✅ OpenGraph image: 1200x630px (OK)
# ⚠️ No hreflang tags found
```

### Browser DevTools Checklist

**Chrome DevTools:**

1. Open Inspector
2. Go to `<head>`
3. Check: `<meta name="description">`
4. Check: `<meta property="og:*">`
5. Check: `<link rel="canonical">`

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator

**Facebook Debugger:**
https://developers.facebook.com/tools/debug/

**LinkedIn Post Inspector:**
https://www.linkedin.com/post-inspector/

---

## 📝 Ejemplos Completos

### Página de Producto

```typescript
// app/productos/[slug]/page.tsx

import { buildMetadata } from "@/lib/seo/metadata";
import { getProductoBySlug } from "@/lib/supabase/queries";
import { SITE_CONFIG } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const producto = await getProductoBySlug(params.slug);

  if (!producto) {
    return buildMetadata({
      title: "Producto no encontrado",
      description: "El producto no existe o fue removido.",
      robots: "noindex, nofollow",
    });
  }

  const precio = producto.variaciones[0]?.precio || producto.precio_desde;

  return buildMetadata({
    title: `${producto.nombre} - Fira Estudio`,
    description: `${producto.descripcion || "Descubre este textil artesanal"} desde $${precio}`,
    image: producto.imagen_destacada?.url,
    url: `${SITE_CONFIG.url}/productos/${producto.slug}`,
    type: "product",
    keywords: [producto.nombre, "textiles", "artesanal", producto.categoria?.nombre],
  });
}

export default async function ProductPage({ params }) {
  const producto = await getProductoBySlug(params.slug);

  return (
    // ... page content
  );
}
```

### Página de Categoría

```typescript
// app/productos/[categoria]/page.tsx

export async function generateMetadata({ params }) {
  const categoria = await getCategoriaBySlug(params.categoria);

  return buildMetadata({
    title: `${categoria.nombre} - Compra Online en Fira Estudio`,
    description: `Descubre nuestra colección de ${categoria.nombre}. Textiles artesanales de calidad.`,
    url: `${SITE_CONFIG.url}/productos?categoria=${categoria.slug}`,
    type: "website",
  });
}
```

---

## 🔄 Actualización y Mantenimiento

Si necesitas agregar nuevos campos o cambiar la estructura:

1. **Actualiza `lib/seo/metadata.ts`**
   - Agrega interfaz del nuevo campo
   - Actualiza la función buildMetadata
   - Añade valores por defecto

2. **Actualiza este documento**
   - Documenta el nuevo campo
   - Agrega ejemplos de uso
   - Actualiza signature

3. **Migra páginas existentes**
   - Busca lugares donde se use metadata manualmente
   - Reemplaza con buildMetadata
   - Valida en browser

---

## 📚 Referencias Externas

- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Markup](https://schema.org/)
- [Google Search Console](https://search.google.com/search-console)
- [SEO Best Practices](https://developers.google.com/search/docs)

---
