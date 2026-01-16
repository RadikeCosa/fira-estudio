---
title: "GitHub Copilot Instructions - Muma Estudio"
description: "Development guidelines for textile e-commerce with Next.js 15 + Supabase"
version: "3.0"
lastUpdated: "2026-01-16"
stack:
  - Next.js 15 (App Router)
  - TypeScript (strict mode)
  - Supabase (PostgreSQL + Storage)
  - Tailwind CSS
  - Vercel
---

# GitHub Copilot Instructions - Muma Estudio

## 🎯 Project Context

**Muma Estudio** is an artisan textile e-commerce (tablecloths, napkins, table runners) with products that have multiple size and color variations.

- **V1 (Current):** Visual catalog + WhatsApp inquiries
- **V2 (Future):** Shopping cart + Mercado Pago payments

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

- **Framework:** Next.js 15 (App Router)
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
  ├── utils/        # Utilities (formatPrice, etc.)
  └── types.ts      # Shared TypeScript types
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

📋 **Complete query patterns:** `.github/skills/supabase-queries/SKILL.md`

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
  const response = await fetch('/api/productos');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
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

**Naming Conventions:**
- Components: `PascalCase` (ProductCard, VariationSelector)
- Functions/variables: `camelCase` (getProductos, isLoading)
- Constants: `UPPER_SNAKE_CASE` (SITE_CONFIG, ERROR_MESSAGES)
- Booleans: `is/has/should` prefix (isLoading, hasError, shouldDisplay)

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

**Database Operations:**
- 📋 `.github/skills/supabase-queries/SKILL.md`
- Use when: Building queries, handling relations, filtering/sorting data
- Triggers: "query", "relaciones", "obtener productos", "filtrar"

**WhatsApp Integration:**
- 📋 `.github/skills/whatsapp-integration/SKILL.md`
- Use when: Creating contact links, formatting messages, WhatsApp buttons
- Triggers: "WhatsApp", "mensaje", "consulta", "contacto"

**Product Variations:**
- 📋 `.github/skills/product-variations/SKILL.md`
- Use when: Building selectors, price calculations, stock management
- Triggers: "variaciones", "tamaño", "color", "selector", "stock"

**Reference Documentation:**
- 📋 `.github/reference/database-schema.md` - Complete SQL schema
- 📋 `.github/reference/business-logic.md` - Business rules and workflows

---

## ❌ What NOT to Do

### Anti-Patterns to Avoid

**TypeScript:**
```typescript
// ❌ Never use 'any'
const data: any = await fetch();

// ❌ Don't skip return types
function getUser() { return user; }

// ❌ Don't use implicit types
let value = getData();
```

**Supabase:**
```typescript
// ❌ Cannot order nested relations
.order('variaciones(precio)') // Doesn't work!

// ✅ Sort in JavaScript instead
data.forEach(p => {
  p.variaciones.sort((a, b) => a.precio - b.precio);
});

// ❌ Wrong column name
.eq('disponible', true) // Column doesn't exist

// ✅ Use correct column
.eq('activo', true)
```

**Components:**
```typescript
// ❌ Don't use Client Component unnecessarily
'use client';
export default async function Page() {
  const data = await fetch(); // Can be Server Component!
}

// ❌ Don't forget to handle loading states
export default async function Page() {
  const data = await getProductos();
  return <List data={data} />; // Missing Suspense!
}
```

**Styling:**
```typescript
// ❌ Don't use inline styles
<div style={{ color: 'red' }}>

// ✅ Use Tailwind classes
<div className="text-red-500">

// ❌ Don't hardcode breakpoints
@media (min-width: 768px) { }

// ✅ Use Tailwind breakpoints
className="md:flex-row"
```

---

## 📚 Progressive Disclosure

This file contains **core rules only**. For detailed patterns and implementations, reference:

**Skills (Activated Automatically):**
- Supabase query patterns → `.github/skills/supabase-queries/SKILL.md`
- WhatsApp integration → `.github/skills/whatsapp-integration/SKILL.md`
- Product variations → `.github/skills/product-variations/SKILL.md`

**Reference Documentation (Manual Lookup):**
- Complete database schema → `.github/reference/database-schema.md`
- Business rules & workflows → `.github/reference/business-logic.md`

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

## 🚀 V2 Features (Future)

**Do NOT implement these unless explicitly requested:**

- Shopping cart (Context API + localStorage)
- Mercado Pago integration
- Server Actions for checkout
- Order management system
- User accounts (Supabase Auth)
- Admin panel

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

## 🎓 Remember

1. **Server Components by default** - only use Client Components when necessary
2. **TypeScript strict mode** - explicit types, never `any`
3. **Sort relations in JavaScript** - Supabase limitation
4. **Use `activo` column** - not `disponible`
5. **Mobile-first responsive** - Tailwind breakpoints
6. **Centralized constants** - import from `lib/constants`
7. **Reference skills** - detailed patterns in `.github/skills/`
