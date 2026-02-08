---
title: "Component Patterns Reference"
description: "Detailed React component patterns, naming conventions, and code examples"
version: "1.0"
lastUpdated: "2026-02-02"
---

## Component Patterns Reference

Complete guide to component structure, naming conventions, and content/style centralization patterns for Fira Estudio.

---

## 📐 Component Structure

### Loading States

**Option 1: Suspense boundaries**

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ProductosSkeleton />}>
      <ProductosContent />
    </Suspense>
  );
}
```

**Option 2: loading.tsx file (App Router)**

```typescript
// app/productos/loading.tsx
export default function Loading() {
  return <ProductosSkeleton />;
}
```

### Composition Pattern

**Prefer composition over large monolithic components:**

```typescript
// ✅ CORRECT: Small, composable components
export function ProductCard({ producto }: { producto: ProductoCompleto }) {
  return (
    <article>
      <ProductImage producto={producto} />
      <ProductInfo producto={producto} />
      <ProductActions producto={producto} />
    </article>
  );
}

// ❌ INCORRECT: Monolithic component
export function ProductCard({ producto }: { producto: ProductoCompleto }) {
  return (
    <article>
      {/* 200+ lines of mixed concerns */}
    </article>
  );
}
```

### Reusable UI Components

Extract common UI patterns to `components/ui/`:

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  // Implementation
}
```

---

## 🏷️ Naming Conventions

### Components

**Use PascalCase:**

```typescript
// ✅ CORRECT
ProductCard;
VariationSelector;
MobileNav;
WhatsAppButton;

// ❌ INCORRECT
productCard;
variation_selector;
mobile - nav;
```

### Functions and Variables

**Use camelCase:**

```typescript
// ✅ CORRECT
const productos = await getProductos();
const isLoading = true;
const handleClick = () => {};

// ❌ INCORRECT
const Productos = await GetProductos();
const IsLoading = true;
const HandleClick = () => {};
```

### Constants

**Use UPPER_SNAKE_CASE:**

```typescript
// ✅ CORRECT
export const SITE_CONFIG = {
  name: "Fira Estudio",
  url: "https://firaestudio.com",
};

export const ERROR_MESSAGES = {
  NOT_FOUND: "Producto no encontrado",
  SERVER_ERROR: "Error del servidor",
};

// ❌ INCORRECT
export const siteConfig = { ... };
export const errorMessages = { ... };
```

### Content Exports

**Use UPPER_SNAKE_CASE with \_CONTENT suffix:**

```typescript
// lib/content/home.ts
export const HOME_CONTENT = {
  hero: {
    title: "Fira Estudio",
    subtitle: "Textiles artesanales",
  },
};

// lib/content/contacto.ts
export const CONTACTO_CONTENT = {
  title: "Contacto",
  description: "Hablemos de tu proyecto",
};
```

### Design Tokens

**Use UPPER_SNAKE_CASE:**

```typescript
// lib/design/tokens.ts
export const TYPOGRAPHY = {
  heading: {
    page: "text-4xl font-bold",
    section: "text-3xl font-semibold",
  },
};

export const SPACING = {
  sectionPadding: {
    sm: "px-4 py-12",
    md: "px-4 py-20 sm:px-6 sm:py-28",
  },
};

export const COLORS = {
  primary: "text-primary",
  secondary: "text-secondary",
};
```

### Boolean Variables

**Use is/has/should prefix:**

```typescript
// ✅ CORRECT
const isLoading = true;
const hasError = false;
const shouldDisplay = true;
const canSubmit = false;

// ❌ INCORRECT
const loading = true;
const error = false;
const display = true;
const submit = false;
```

---

## 🎨 Content & Style Centralization

### Why Centralize?

1. **Single source of truth** - No duplicate content
2. **Easy updates** - Change once, updates everywhere
3. **Consistency** - Same styles across all components
4. **Type safety** - TypeScript autocomplete for content
5. **Better code review** - Content changes separate from logic

### Content Centralization Pattern

**❌ INCORRECT: Hardcoded text**

```typescript
export function HeroSection() {
  return (
    <section>
      <h1>Fira Estudio</h1>
      <p>Textiles artesanales para tu hogar</p>
      <button>Ver Productos</button>
    </section>
  );
}
```

**✅ CORRECT: Centralized content**

```typescript
import { HOME_CONTENT } from "@/lib/content/home";

export function HeroSection() {
  const { title, subtitle, cta } = HOME_CONTENT.hero;

  return (
    <section>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button>{cta.primary}</button>
    </section>
  );
}
```

### Style Centralization Pattern

**❌ INCORRECT: Hardcoded styles**

```typescript
export function HeroSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <h1 className="text-4xl font-bold text-gray-900">Fira Estudio</h1>
      <p className="text-lg text-gray-600 mt-4">Textiles artesanales</p>
    </section>
  );
}
```

**✅ CORRECT: Design tokens**

```typescript
import { HOME_CONTENT } from "@/lib/content/home";
import { TYPOGRAPHY, SPACING, COLORS } from "@/lib/design/tokens";

export function HeroSection() {
  const { title, subtitle } = HOME_CONTENT.hero;

  return (
    <section className={SPACING.sectionPadding.md}>
      <h1 className={TYPOGRAPHY.heading.page}>{title}</h1>
      <p className={`${TYPOGRAPHY.body.large} ${COLORS.secondary}`}>
        {subtitle}
      </p>
    </section>
  );
}
```

### Complete Example

**Full pattern combining content + styles:**

```typescript
import { HOME_CONTENT } from "@/lib/content/home";
import { TYPOGRAPHY, SPACING, ANIMATIONS } from "@/lib/design/tokens";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { title, subtitle, cta } = HOME_CONTENT.hero;

  return (
    <section className={SPACING.sectionPadding.md}>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className={cn(TYPOGRAPHY.heading.page, ANIMATIONS.fadeIn)}>
          {title}
        </h1>

        <p className={cn(TYPOGRAPHY.body.large, ANIMATIONS.fadeIn, "mt-6")}>
          {subtitle}
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <Button href="/productos" variant="primary" size="lg">
            {cta.primary}
          </Button>
          <Button href="/sobre-nosotros" variant="secondary" size="lg">
            {cta.secondary}
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

## 🔗 Related Documentation

- **Main Instructions**: `.github/instructions/copilot-instructions.instructions.md`
- **Anti-Patterns**: `.github/reference/anti-patterns.md`
- **Business Logic**: `.github/reference/business-logic.md`
- **Content Management**: `docs/CONTENT_AND_STYLE_MANAGEMENT.md`
