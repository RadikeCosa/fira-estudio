# 🌐 Metadata para Beginners

¿Qué es eso de metadata, SEO y og:image? Este documento lo explica sin tecnicismos.

---

## ¿Qué es Metadata?

Metadata = "datos sobre datos". Son información **invisible** que le dices al navegador y a Google.

### Ejemplo Real

Imagina que tienes un libro. El **contenido del libro** es el cuerpo de la página web. La **metadata** es:

- **Título del libro** (aparece en Google)
- **Descripción en la contraportada** (aparece en Google)
- **Imagen de portada** (aparece cuando compartes en WhatsApp/Twitter)
- **ISBN** (eso es como JSON-LD, información estructurada)

```html
<!-- VISIBLE en el sitio -->
<h1>Remeras de algodón 100%</h1>
<img src="remera.jpg" alt="Remera" />

<!-- INVISIBLE pero importante (Metadata) -->
<meta name="description" content="Remeras de algodón..." />
<meta property="og:image" content="https://fira.com/remera.jpg" />
<meta property="og:title" content="Remera de algodón - Fira Estudio" />
```

---

## ¿Por Qué Importa?

### Razón 1: Google necesita entender qué es tu página

Google NO ve "ah, esto es una remera". Ve HTML. Necesitas DECIRLE:

- Qué es tu página (título)
- De qué trata (descripción)
- Estructura de datos (JSON-LD)

Sin metadata, Google no entiende qué es lo que vendes.

### Razón 2: Cuando compartes en redes sociales

Cuando compartes un link en WhatsApp, Twitter, Instagram, el otro usuario VE:

- **Imagen grande** ← de `og:image`
- **Título** ← de `og:title`
- **Descripción pequeña** ← de `og:description`

Sin metadata → compartir vemos un link feo sin imagen.

```
❌ SIN METADATA
https://fira.com/productos/remera-123

✅ CON METADATA
[Imagen de remera]
Remera de algodón 100% - Fira Estudio
Cómoda, fresca y sostenible. $45
```

---

## Los 4 Tipos de Metadata Importantes

### 1. Metadata Básica

```html
<meta
  name="description"
  content="Lo que describe tu página en 160 caracteres max"
/>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Título de tu página - Fira Estudio</title>
```

**Para qué sirve:** Google muestra en resultados de búsqueda.

### 2. Open Graph (Redes Sociales)

```html
<meta property="og:title" content="Remera de algodón" />
<meta property="og:description" content="100% algodón, cómoda y fresca" />
<meta property="og:image" content="https://fira.com/remera.jpg" />
<meta property="og:url" content="https://fira.com/productos/remera-123" />
<meta property="og:type" content="product" />
```

**Para qué sirve:** Cuando compartes en redes sociales, aparecen estos datos.

### 3. Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Remera de algodón" />
<meta name="twitter:description" content="100% algodón" />
<meta name="twitter:image" content="https://fira.com/remera.jpg" />
```

**Para qué sirve:** Cómo se ve tu link compartido en Twitter.

### 4. JSON-LD (Estructura de Datos)

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Remera de algodón",
    "description": "100% algodón",
    "image": "https://fira.com/remera.jpg",
    "brand": "Fira Estudio",
    "price": "45"
  }
</script>
```

**Para qué sirve:** Google lo entiende perfectamente. Puede mostrar "precio: $45" directamente en búsqueda.

---

## Cómo Agregar Metadata en Next.js

### Método 1: Función `buildMetadata()` (Recomendado)

Usamos una función central para TODAS las páginas:

```typescript
// lib/seo/metadata.ts
import { Metadata } from "next";

export function buildMetadata(
  title: string,
  description: string,
  image?: string,
  customData?: Record<string, any>,
): Metadata {
  return {
    title: `${title} - Fira Estudio`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      type: "website",
      url: "https://fira.com",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image,
    },
    ...customData,
  };
}
```

### Método 2: Usar en una página de producto

```typescript
// app/productos/[slug]/page.tsx
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const producto = await getProducto(params.slug);

  return buildMetadata(
    producto.nombre,  // Título
    producto.descripcion,  // Descripción
    producto.imagen_url  // Imagen
  );
}

export default function ProductoPage({ params }) {
  const producto = await getProducto(params.slug);

  return (
    <div>
      <h1>{producto.nombre}</h1>
      <img src={producto.imagen_url} />
      {/* ... */}
    </div>
  );
}
```

### Método 3: JSON-LD para producto

```typescript
// app/productos/[slug]/page.tsx
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const producto = await getProducto(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion,
    image: producto.imagen_url,
    brand: {
      "@type": "Brand",
      name: "Fira Estudio",
    },
    offers: {
      "@type": "Offer",
      price: producto.precio,
      priceCurrency: "ARS",
      availability: producto.stock > 0 ? "InStock" : "OutOfStock",
    },
  };

  return buildMetadata(
    producto.nombre,
    producto.descripcion,
    producto.imagen_url,
    {
      other: {
        "script:ld-json": JSON.stringify(jsonLd),
      },
    },
  );
}
```

---

## Ejemplos Completos

### Página de Categoría

```typescript
// app/productos/page.tsx
export async function generateMetadata() {
  return buildMetadata(
    "Todos los Productos",
    "Explora nuestra colección completa de ropa sostenible",
    "/images/hero.jpg"
  );
}

export default async function ProductosPage() {
  return (
    <div>
      <h1>Todos los Productos</h1>
      {/* ... */}
    </div>
  );
}
```

**Resultado:**

- Google ve: Título "Todos los Productos", Descripción clara
- WhatsApp ve: Imagen + título + descripción
- Aparece bien en búsqueda

### Página de Producto Individual

```typescript
// app/productos/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const producto = await getProducto(params.slug);

  return buildMetadata(
    `${producto.nombre} - ${producto.precio} ARS`,
    `${producto.descripcion}. Compra ahora en Fira Estudio.`,
    producto.imagen_principal_url
  );
}

export default async function ProductoPage({ params }) {
  const producto = await getProducto(params.slug);

  return (
    <div>
      <h1>{producto.nombre}</h1>
      <img src={producto.imagen_principal_url} />
      <p>{producto.descripcion}</p>
      <p>Precio: ${producto.precio}</p>
    </div>
  );
}
```

**Resultado:**

- Google ve precio directamente
- Al compartir en WhatsApp: imagen bonita + título + precio
- Stock actualizado en JSON-LD

---

## Checklist: ¿Tengo Metadata Correcta?

- [ ] Página de inicio tiene `<title>` único
- [ ] Página de productos tiene `<title>` con nombre de producto
- [ ] Cada página tiene `description` (160 caracteres max)
- [ ] Cada página tiene `og:image` (1200x630px ideal)
- [ ] Productos tienen JSON-LD con precio y stock
- [ ] Puedo compartir un link en WhatsApp y se ve bien
- [ ] En Google Search Console (tools.google.com) veo los links sin errores

---

## Verificar que está funcionando

### Herramienta 1: Open Graph Preview

Pega tu URL aquí:
https://www.opengraphcheck.com/

Deberías ver:

- ✓ Imagen
- ✓ Título
- ✓ Descripción

### Herramienta 2: Google Rich Results

https://search.google.com/test/rich-results

Copia y pega el HTML de tu página. Deberías ver:

- ✓ "Valid rich result"
- ✓ Tipo de elemento (Product, Article, etc.)

### Herramienta 3: Verificar en Dev Tools

```
1. Abre tu página en navegador
2. Click derecho → Inspeccionar
3. Click en la pestaña "Elements" / "Inspector"
4. Busca:
   <meta name="description" content="..." />
   <meta property="og:image" content="..." />
   <meta property="og:title" content="..." />
```

Si ves eso, ✓ metadata está bien.

---

## Errores Comunes

### ❌ Error 1: Metadata igual en todas las páginas

```typescript
// ✗ MALO
export const metadata: Metadata = {
  title: "Fira Estudio",
  description: "Tienda de ropa",
};
```

**Problema:** Todas las páginas tienen el mismo título. Google lo penaliza.

**Solución:** Usa `generateMetadata()` para cada página.

### ❌ Error 2: Imagen muy grande

```typescript
// ✗ MALO
og: image: "/images/foto-12mb.jpg"; // 12MB!
```

**Problema:** Redes sociales rechazan imágenes grandes.

**Solución:** Usa imágenes ~100-300 KB, 1200x630px.

### ❌ Error 3: Falta JSON-LD en productos

```typescript
// ✗ MALO
export function ProductoPage() {
  return <div>{/* sin JSON-LD */}</div>;
}
```

**Problema:** Google no entiende precio, stock, rating.

**Solución:** Agrega JSON-LD con `@type: "Product"`.

---

## ¿Cómo SEO afecta a ventas?

```
Google search: "remeras algodón Argentina"

❌ SIN METADATA
[Sin imagen]
https://fira.com/...
Sin descripción clara

✅ CON METADATA
[Imagen bonita de remera]
Remera de algodón 100% - Fira Estudio
Cómoda, fresca, sostenible. Desde $45
⭐⭐⭐⭐⭐
```

**Resultado:** Con metadata, 3x más clicks = 3x más posibles clientes.

---

## Resumen

| Elemento         | Para qué            | Ejemplo                            |
| ---------------- | ------------------- | ---------------------------------- |
| `<title>`        | Búsqueda en Google  | "Remera de algodón - Fira Estudio" |
| `description`    | Búsqueda en Google  | "100% algodón, cómoda y fresca..." |
| `og:image`       | Redes sociales      | Imagen de 1200x630px               |
| `og:title`       | Redes sociales      | "Remera de algodón"                |
| `og:description` | Redes sociales      | Descripción corta                  |
| JSON-LD          | Google Rich Results | Estructura de producto             |

---

## 📚 Próximos Pasos

1. Lee `docs/METADATA_STANDARD.md` para detalles técnicos
2. Abre `lib/seo/metadata.ts` y entiende `buildMetadata()`
3. Busca una página en `app/` y agrega `generateMetadata()`
4. Prueba con https://www.opengraphcheck.com/

---

**Hecho por:** Fira Estudio Dev Team  
**Última actualización:** 29/01/2026
