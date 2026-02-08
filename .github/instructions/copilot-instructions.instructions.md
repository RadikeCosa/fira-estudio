---
name: "GitHub Copilot Instructions - Fira Estudio"
description: "Development guidelines for textile e-commerce with Next.js 16 + Supabase"
applyTo: "**"
---

# GitHub Copilot Instructions - Fira Estudio

## 🎯 Project Context

**Fira Estudio** is an artisan textile e-commerce (tablecloths, napkins, table runners) with products that have multiple size and color variations.

- **V2:** Shopping cart + Mercado Pago payments

### Business Model

```
Base Product:  "Mantel Floral"
├── Variation 1: 150x200cm - Red - $15,000 (stock: 5)
├── Variation 2: 150x200cm - Blue - $15,000 (stock: 3)
└── Variation 3: 180x250cm - Red - $18,500 (stock: 2)
```

**Key Concepts:**

- Prices live in **variations**, not base products
- Each product can have multiple size/color combinations
- `stock = 0` means "available on request" (not out of stock)
- Images can be shared or variation-specific
- V1 uses WhatsApp for all customer inquiries (no checkout)

---

## 🏗️ Architecture Overview

### Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS (utility-first)
- **Deployment:** Vercel

### Directory Structure

```
app/                 # Pages and layouts (App Router)
components/          # React components by domain
  ├── layout/       # Header, Footer, MobileNav
  ├── productos/    # ProductCard, ProductGallery, VariationSelector
  └── ui/           # Reusable primitives (future)
lib/                # Business logic
  ├── constants/    # Global config (SITE_CONFIG, WHATSAPP)
  ├── supabase/     # Clients (server.ts, client.ts) and queries
  ├── repositories/ # Repository layer (ProductoRepository, BaseRepository)
  ├── utils/        # Utilities (formatPrice, etc.)
  └── types.ts      # Shared TypeScript types
```

### Centralized Content & Styles

**Content Files** (all text is centralized):

- `lib/content/home.ts` - Home page text
- `lib/content/contacto.ts` - Contact page text
- `lib/content/sobre-nosotros.ts` - About page text
- `lib/content/productos.ts` - Products page text

**Design Tokens** (all styles are centralized):

- `lib/design/tokens.ts` - COLORS, TYPOGRAPHY, SPACING, COMPONENTS, LAYOUT, ANIMATIONS

**Convention**: Never hardcode text or repeated style classes in components. Always import from centralized files.

**Example (CORRECT)**:

```typescript
import { HOME_CONTENT } from "@/lib/content/home";
import { TYPOGRAPHY, SPACING } from "@/lib/design/tokens";

export function HeroSection() {
  return (
    <section className={SPACING.sectionPadding.md}>
      <h1 className={TYPOGRAPHY.heading.page}>
        {HOME_CONTENT.hero.title}
      </h1>
    </section>
  );
}
```

**Example (INCORRECT)**:

```typescript
// ❌ Don't hardcode text
<h1>Fira Estudio</h1>

// ❌ Don't duplicate style strings
<section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
```

### Database Schema

**Tables:** `categorias`, `productos`, `variaciones`, `imagenes_producto`, `consultas`

**Key Relations:**

- `productos` → `categorias` (many-to-one)
- `productos` → `variaciones` (one-to-many)
- `productos` → `imagenes_producto` (one-to-many)

📋 **Complete schema:** `.github/reference/database-schema.md`

---

## 📜 Core Rules

### 1. TypeScript Strict Mode

**Always:**

- Explicit types on all function parameters and return values
- Use `interface` for objects, `type` for unions
- Business property names in **Spanish**, code/comments in **English**
- **NEVER** use `any`

```typescript
// ✅ CORRECT
export async function getProductos(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
  // ...
}

// ❌ WRONG
let data: any; // Never use 'any'
function get() {} // Missing return type
```

---

### 2. Server vs Client Components

**Default: Server Component** (no `'use client'`)

Use Server Components for:

- Database queries
- Metadata generation
- Static content

**Client Components only when:**

- Need React hooks (`useState`, `useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)

```typescript
// ✅ Server Component (default)
export default async function ProductosPage() {
  const productos = await getProductos(); // Direct query
  return <ProductGrid productos={productos} />;
}

// ✅ Client Component (only when necessary)
'use client';
export function VariationSelector() {
  const [selected, setSelected] = useState(null);
  return <select onChange={(e) => setSelected(e.target.value)} />;
}
```

---

### 3. Supabase Client Selection

Import the correct client based on component type:

```typescript
// ✅ Server Components
import { createClient } from "@/lib/supabase/server";

// ✅ Client Components
import { createClient } from "@/lib/supabase/client";
```

**Key patterns:**

- Always check for `error` before using `data`
- Use `.eq("activo", true)` for active records (not `disponible`)
- ⚠️ **Cannot order nested relations** - sort in JavaScript after fetch
- Use `.single()` for queries expecting one result

📋 **Complete query patterns:** `.github/skills/data-layer/SKILL.md`

**Repository Layer (productos):**

- `lib/repositories/producto.repository.ts` encapsula Supabase
- Usa `findAll` con filtros `{ categoria, limit, offset }` y ordena relaciones en JS
- `getProductos` y `getProductoBySlug` consumen el repositorio (API pública se mantiene)

---

### 4. Error Handling Pattern

**Server Components:**

```typescript
const { data, error } = await supabase
  .from("productos")
  .select("*")
  .eq("slug", slug)
  .single();

// Handle not found
if (error) {
  if (error.code === "PGRST116") {
    return notFound(); // Triggers not-found.tsx
  }
  console.error("Database error:", error);
  throw error; // Triggers error.tsx
}
```

**Client Components:**

```typescript
try {
  const response = await fetch("/api/productos");
  if (!response.ok) throw new Error("Failed to fetch");
  const data = await response.json();
} catch (error) {
  console.error("Error:", error);
  setError(error.message);
}
```

---

### 5. Component Patterns

**Loading States:**

```typescript
// Option 1: Suspense boundaries
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<ProductosSkeleton />}>
      <ProductosContent />
    </Suspense>
  );
}

// Option 2: loading.tsx file (App Router)
// app/productos/loading.tsx
export default function Loading() {
  return <ProductosSkeleton />;
}
```

**Component Structure:**

- Use centralized content: `import { HOME_CONTENT } from "@/lib/content/home"`
- Use design tokens: `import { TYPOGRAPHY, SPACING } from "@/lib/design/tokens"`
- Prefer composition over large monolithic components
- Extract reusable UI components to `components/ui/`

**Naming Conventions:**

- Components: `PascalCase` (ProductCard, VariationSelector)
- Functions/variables: `camelCase` (getProductos, isLoading)
- Constants: `UPPER_SNAKE_CASE` (SITE_CONFIG, ERROR_MESSAGES)
- Content exports: `UPPER_SNAKE_CASE` with `_CONTENT` suffix (HOME_CONTENT, CONTACTO_CONTENT)
- Design tokens: `UPPER_SNAKE_CASE` (TYPOGRAPHY, SPACING, COLORS)
- Booleans: `is/has/should` prefix (isLoading, hasError, shouldDisplay)

📋 **Complete patterns and examples**: `.github/reference/component-patterns.md`

---

### 6. Styling with Tailwind

**Mobile-first approach:**

```tsx
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4 sm:gap-6 lg:gap-8
">
```

**Breakpoints:**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Best practices:**

- Multi-line class declarations for readability
- Group related utilities (layout, spacing, colors)
- Use design tokens from Tailwind config

---

### 7. Constants & Configuration

Centralize all configuration:

```typescript
// ✅ Use centralized constants
import { SITE_CONFIG, WHATSAPP, ERROR_MESSAGES } from "@/lib/constants";

// ✅ Import types
import type { Producto, ProductoCompleto, Variacion } from "@/lib/types";

// ✅ Import queries
import { getProductos, getProductoBySlug } from "@/lib/supabase/queries";
```

---

## 🎯 When to Load Additional Skills

GitHub Copilot will automatically activate these skills when relevant:

**Data Layer (Database & Variations):**

- 📋 `.github/skills/data-layer/SKILL.md`
- Use when: Building queries, handling relations, product variations, filtering/sorting data
- Triggers: "query", "relaciones", "supabase", "variaciones", "tamaño", "color", "stock", "precio", "getProductos", "getProductoBySlug", "VariationSelector"

**E-commerce (Cart & Analytics):**

- 📋 `.github/skills/ecommerce/SKILL.md`
- Use when: Shopping cart, analytics tracking, GA4 events, conversion tracking
- Triggers: "carrito", "cart", "agregar", "checkout", "analytics", "ga4", "tracking", "gtag", "evento"

**Interactions (WhatsApp & Hooks):**

- 📋 `.github/skills/interactions/SKILL.md`
- Use when: WhatsApp integration, custom hooks, modals, drawers, focus management
- Triggers: "whatsapp", "consulta", "rate-limit", "hooks", "useScrollLock", "useEscapeKey", "modal", "drawer"

**Quality (Testing & A11y/Performance):**

- 📋 `.github/skills/quality/SKILL.md`
- Use when: Writing tests, accessibility improvements, performance optimization
- Triggers: "test", "testing", "vitest", "accessibility", "a11y", "performance", "lighthouse", "aria"

**Reference Documentation:**

- 📋 `.github/reference/database-schema.md` - Complete SQL schema
- 📋 `.github/reference/business-logic.md` - Business rules and workflows

---

## 📚 Progressive Disclosure

This file contains **core rules only**. For detailed patterns and implementations, reference:

**Skills (Activated Automatically):**

- Data layer (queries & variations) → `.github/skills/data-layer/SKILL.md`
- E-commerce (cart & analytics) → `.github/skills/ecommerce/SKILL.md`
- Interactions (WhatsApp & hooks) → `.github/skills/interactions/SKILL.md`
- Quality (testing & a11y/performance) → `.github/skills/quality/SKILL.md`

**Reference Documentation (Manual Lookup):**

- Complete database schema → `.github/reference/database-schema.md`
- Business rules & workflows → `.github/reference/business-logic.md`
- Component patterns & naming → `.github/reference/component-patterns.md`
- Anti-patterns guide → `.github/reference/anti-patterns.md`
- Content & style management → `docs/CONTENT_AND_STYLE_MANAGEMENT.md`

**Code Implementation:**

- TypeScript types → `lib/types.ts`
- Constants → `lib/constants/index.ts`
- Queries → `lib/supabase/queries.ts`
- Supabase clients → `lib/supabase/server.ts`, `lib/supabase/client.ts`

---

## ✅ Quality Checklist

Before suggesting code, verify:

- [ ] Types are explicit (no `any`)
- [ ] Server Component by default (or `'use client'` justified)
- [ ] Supabase queries use `activo` column (not `disponible`)
- [ ] Relations sorted in JavaScript (not in query)
- [ ] Imports use absolute paths (`@/`)
- [ ] Constants imported from `lib/constants`
- [ ] Styling follows mobile-first approach
- [ ] Naming conventions followed
- [ ] Error handling implemented
- [ ] Loading states handled

---

## 🚀 V2 Features Reference

When working with V2 features, load these skills:

- **Shopping Cart**: `.github/skills/carrito/SKILL.md` - Cart management, localStorage, Context API
- **Analytics**: `.github/skills/analytics/SKILL.md` - GA4 tracking, ecommerce events

---

## 📖 Commit Conventions

Use Conventional Commits format:

```bash
feat: Add variation selector component
fix: Correct price sorting in product cards
style: Improve mobile layout spacing
refactor: Extract WhatsApp logic to utility
docs: Update README with setup instructions
```

---

## **E-commerce (Cart & Analytics):**

- 📋 `.github/skills/ecommerce/SKILL.md`
- Use when: Shopping cart, analytics tracking, GA4 events, conversion tracking
- Triggers: "carrito", "cart", "agregar", "checkout", "analytics", "ga4", "tracking", "gtag", "evento"
