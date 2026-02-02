# Content Management Guide

## Objetivo

Centralizar todo el contenido de texto en `lib/content/` para que cambios de texto NO requieran tocar código de componentes.

---

## 📚 Estructura de Contenido

### Ubicación

```
lib/content/
├── home.ts              # Home page text
├── contacto.ts          # Contact page text
├── sobre-nosotros.ts    # About page text
└── productos.ts         # Products page text
```

### Patrón de Organización

Cada archivo exporta una constante con la estructura de contenido de esa página:

```typescript
// lib/content/home.ts
export const HOME_CONTENT = {
  hero: {
    title: "Textiles Artesanales",
    subtitle: "Descubre la belleza de lo hecho a mano",
    cta: "Explorar colección",
  },
  features: [
    { title: "Artesanal", description: "Hecho con pasión" },
    { title: "Sostenible", description: "Materiales de calidad" },
  ],
  testimonials: { ... },
};
```

---

## 🎯 Tipos de Contenido

### 1. Texto Simple (strings)

```typescript
// lib/content/contacto.ts
export const CONTACTO_CONTENT = {
  title: "Ponte en contacto",
  description: "Nos encantaría escucharte",
};

// Uso en componente:
import { CONTACTO_CONTENT } from "@/lib/content/contacto";

export function ContactPage() {
  return <h1>{CONTACTO_CONTENT.title}</h1>;
}
```

### 2. Arreglos de Objetos

```typescript
// lib/content/productos.ts
export const PRODUCTOS_CONTENT = {
  categories: [
    { slug: "manteles", label: "Manteles" },
    { slug: "servilletas", label: "Servilletas" },
    { slug: "corredores", label: "Corredores" },
  ],
};

// Uso en componente:
import { PRODUCTOS_CONTENT } from "@/lib/content/productos";

export function CategoryFilter() {
  return (
    <div>
      {PRODUCTOS_CONTENT.categories.map(cat => (
        <label key={cat.slug}>{cat.label}</label>
      ))}
    </div>
  );
}
```

### 3. Objetos Anidados

```typescript
// lib/content/home.ts
export const HOME_CONTENT = {
  sections: {
    hero: {
      title: "Bienvenido",
      items: ["Item 1", "Item 2"],
    },
    features: {
      title: "Por qué elegir Fira",
      list: [
        { icon: "star", text: "Calidad superior" },
        { icon: "heart", text: "Hecho con amor" },
      ],
    },
  },
};

// Uso:
const { hero, features } = HOME_CONTENT.sections;
```

---

## 🛠️ Añadir Nuevo Contenido

### Paso 1: Identificar la página

¿A qué página pertenece?

- Home → `home.ts`
- Contacto → `contacto.ts`
- Sobre Nosotros → `sobre-nosotros.ts`
- Productos → `productos.ts`

### Paso 2: Definir estructura

```typescript
// lib/content/home.ts

export const HOME_CONTENT = {
  // Sección existente
  hero: { ... },

  // Nueva sección
  newSection: {
    title: "Nuevo Título",
    description: "Nueva descripción",
    items: [
      { label: "Item 1", value: "value1" },
      { label: "Item 2", value: "value2" },
    ],
  },
};
```

### Paso 3: Usar en componente

```typescript
import { HOME_CONTENT } from "@/lib/content/home";

export function NewSection() {
  const { title, description, items } = HOME_CONTENT.newSection;

  return (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      <ul>
        {items.map(item => (
          <li key={item.value}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}
```

---

## ✏️ Cambiar Contenido

### Cambio Simple: Actualizar texto

**Antes:**

```typescript
export const HOME_CONTENT = {
  hero: {
    title: "Textiles Artesanales", // ← Cambiar a "Textiles Hechos a Mano"
  },
};
```

**Después:**

```typescript
export const HOME_CONTENT = {
  hero: {
    title: "Textiles Hechos a Mano", // ✅ Actualizado
  },
};
```

**Resultado:** El cambio se refleja automáticamente en la página.

### Cambio Complejo: Agregar item a lista

```typescript
export const PRODUCTOS_CONTENT = {
  categories: [
    { slug: "manteles", label: "Manteles" },
    { slug: "servilletas", label: "Servilletas" },
    { slug: "corredores", label: "Corredores" },
    { slug: "toallas", label: "Toallas" }, // ← Nuevo
  ],
};
```

---

## 🎨 Integración con TypeScript

### Autocomplete en IDE

```typescript
import { HOME_CONTENT } from "@/lib/content/home";

// ✅ IDE sugiere las claves disponibles:
HOME_CONTENT.hero; // ✓
HOME_CONTENT.features; // ✓
HOME_CONTENT.typo; // ✗ Error - key doesn't exist
```

### Type Safety

```typescript
// TypeScript valida tipos en tiempo de compilación
const title: string = HOME_CONTENT.hero.title; // ✓ OK
const count: number = HOME_CONTENT.hero.title; // ✗ Error - type mismatch
```

### Refactoring

Si renombras una clave en `lib/content/home.ts`:

```typescript
// Antes:
export const HOME_CONTENT = {
  hero: { title: "..." }, // Renombrar a "heroSection"
};
```

TypeScript te mostrará TODOS los lugares donde se usa `HOME_CONTENT.hero` y podrás actualizarlos de una vez.

---

## 📖 Mejores Prácticas

### ✅ DO: Centralizar texto

```typescript
// ✅ CORRECTO
// lib/content/home.ts
export const HOME_CONTENT = {
  hero: { title: "Bienvenido" },
};

// components/home/HeroSection.tsx
import { HOME_CONTENT } from "@/lib/content/home";
<h1>{HOME_CONTENT.hero.title}</h1>
```

### ❌ DON'T: Hardcodear texto en componentes

```typescript
// ❌ INCORRECTO
export function HeroSection() {
  return <h1>Bienvenido</h1>;  // Texto hardcodeado
}
```

### ✅ DO: Agrupar contenido relacionado

```typescript
// ✅ CORRECTO
export const CONTACTO_CONTENT = {
  form: {
    labels: { name: "Nombre", email: "Email" },
    placeholders: { name: "Tu nombre", email: "tu@email.com" },
    validation: { nameRequired: "Nombre es requerido" },
  },
};
```

### ❌ DON'T: Esparcir contenido en múltiples archivos

```typescript
// ❌ INCORRECTO - contenido esparcido
// lib/content/form-labels.ts
export const FORM_LABELS = { name: "Nombre" };

// lib/content/form-placeholders.ts
export const FORM_PLACEHOLDERS = { name: "Tu nombre" };

// Difícil de mantener, múltiples imports
```

---

## 🔄 Mantenimiento

### Actualizar después de agregar página

Si crearás una nueva página `/blog`:

1. Crear `lib/content/blog.ts`:

```typescript
export const BLOG_CONTENT = {
  title: "Blog",
  posts: [{ slug: "post-1", title: "Mi primer post" }],
};
```

2. Usar en `app/blog/page.tsx`:

```typescript
import { BLOG_CONTENT } from "@/lib/content/blog";

export const metadata = buildMetadata({
  title: BLOG_CONTENT.title,
  description: "Lee nuestros últimos artículos",
});

export default function BlogPage() {
  return (
    // ... use BLOG_CONTENT
  );
}
```

---

## 🧪 Testing Contenido

### Validación de Estructura

```typescript
// __tests__/lib/content/home.test.ts

import { HOME_CONTENT } from "@/lib/content/home";

describe("HOME_CONTENT", () => {
  it("debería tener todas las secciones requeridas", () => {
    expect(HOME_CONTENT).toHaveProperty("hero");
    expect(HOME_CONTENT).toHaveProperty("features");
    expect(HOME_CONTENT).toHaveProperty("cta");
  });

  it("hero debería tener title y subtitle", () => {
    expect(HOME_CONTENT.hero).toHaveProperty("title");
    expect(HOME_CONTENT.hero).toHaveProperty("subtitle");
  });

  it("texto no debería estar vacío", () => {
    expect(HOME_CONTENT.hero.title).not.toBe("");
    expect(HOME_CONTENT.hero.title.length).toBeGreaterThan(0);
  });
});
```

---

## 📋 Checklist para Nuevo Contenido

- [ ] Contenido definido en `lib/content/*.ts`
- [ ] Exportado como constante (HOME_CONTENT, etc.)
- [ ] Importado correctamente en componentes
- [ ] Sin hardcoding de texto en componentes
- [ ] TypeScript types son correctos
- [ ] IDE muestra autocomplete
- [ ] Tests validan estructura
- [ ] Documentado en este archivo si es estructura nueva

---

## 📚 Referencias

- `lib/content/home.ts` - Contenido de home
- `lib/content/contacto.ts` - Contenido de contacto
- `lib/content/sobre-nosotros.ts` - Contenido de about
- `lib/content/productos.ts` - Contenido de productos
- `.github/instructions/copilot-instructions.md` - Reglas generales
