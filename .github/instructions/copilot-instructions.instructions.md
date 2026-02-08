---
name: "GitHub Copilot Instructions - Fira Estudio"
description: "Development guidelines for textile e-commerce with Next.js + Supabase"
applyTo: "**"
---

# GitHub Copilot Instructions - Fira Estudio

## 🎯 Project Context

**Fira Estudio** is an artisan textile e-commerce (tablecloths, napkins, table runners) with products that have multiple size and color variations.

- **V1:** Product catalog + WhatsApp inquiries
- **V2:** Shopping cart + Mercado Pago payments

### Business Model

Base Product: "Mantel Floral"
├── Variation 1: 150x200cm - Red - $15,000 (stock: 5)
├── Variation 2: 150x200cm - Blue - $15,000 (stock: 3)
└── Variation 3: 180x250cm - Red - $18,500 (stock: 2)

**Key Concepts:**

- Prices live in **variations**, not base products
- Each product can have multiple size/color combinations
- `stock = 0` means **"available on request"**, not out of stock
- Images can be shared or variation-specific
- Base products **do not have prices**

---

## 🏗️ Architecture Overview

### Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL, RLS enabled)
- **Styling:** Tailwind CSS (utility-first)
- **Deployment:** Vercel

### Directory Structure

app/ # Pages and layouts (App Router)
components/ # React components by domain
├── layout/ # Header, Footer, MobileNav
├── productos/ # ProductCard, ProductGallery, VariationSelector
└── ui/ # Reusable primitives
lib/ # Business logic
├── constants/ # Global config (SITE_CONFIG, WHATSAPP)
├── supabase/ # Clients (server.ts, client.ts) and queries
├── repositories/ # Repository layer (ProductoRepository, BaseRepository)
├── utils/ # Utilities (formatPrice, etc.)
└── types.ts # Shared TypeScript types

---

## 📦 Centralized Content & Styles

### Content Files (All text is centralized)

- `lib/content/home.ts`
- `lib/content/contacto.ts`
- `lib/content/sobre-nosotros.ts`
- `lib/content/productos.ts`

### Design Tokens (All styles are centralized)

- `lib/design/tokens.ts`
  - COLORS
  - TYPOGRAPHY
  - SPACING
  - COMPONENTS
  - LAYOUT
  - ANIMATIONS

**Rule:**  
❌ Never hardcode text or repeated Tailwind classes  
✅ Always import from centralized files

**Correct Example:**

```ts
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
🗄️ Database Schema
Tables:
categorias, productos, variaciones, imagenes_producto, consultas

Relations:

productos → categorias (many-to-one)

productos → variaciones (one-to-many)

productos → imagenes_producto (one-to-many)

📋 Full schema: .github/reference/database-schema.md

📜 Core Rules
1. TypeScript (Strict)
Always:

Explicit types on all function parameters and return values

interface → domain models & DTOs

type → unions and utility compositions

Business properties in Spanish

Code and comments in English

NEVER use any

// ✅ Correct
export async function getProductos(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
}

// ❌ Incorrect
let data: any;
function get() {}
2. Server vs Client Components
Default: Server Component

Use Client Components only when necessary:

React hooks (useState, useEffect)

Event handlers

Browser APIs

// Server Component
export default async function ProductosPage() {
  const productos = await getProductos();
  return <ProductGrid productos={productos} />;
}

// Client Component
"use client";
export function VariationSelector() {
  const [selected, setSelected] = useState<string | null>(null);
  return <select onChange={(e) => setSelected(e.target.value)} />;
}
3. Server Actions (Preferred)
Prefer Server Actions over API Routes

Use API Routes only for:

Webhooks (Mercado Pago)

External integrations

"use server";

export async function enviarConsulta(
  input: ConsultaInput
): Promise<void> {
  // ...
}
4. Supabase Client Selection
// Server Components
import { createClient } from "@/lib/supabase/server";

// Client Components
import { createClient } from "@/lib/supabase/client";
Rules:

Always check error before using data

Use .eq("activo", true) (never disponible)

Nested relations cannot be ordered in SQL → sort in JS

Use .single() when expecting one record

Assume RLS is enabled on all tables

Never bypass RLS from client components

📋 Patterns: .github/skills/data-layer/SKILL.md

5. Repository Pattern
Supabase access is encapsulated in repositories

producto.repository.ts handles queries

Public API:

getProductos

getProductoBySlug

Relations are sorted after fetch

6. Error Handling
Server Components:

if (error) {
  if (error.code === "PGRST116") {
    return notFound();
  }
  console.error("Database error:", error);
  throw error;
}
Client Components:

try {
  const response = await fetch("/api/productos");
  if (!response.ok) throw new Error("Failed to fetch");
} catch (error) {
  console.error(error);
}
7. Variations UI Rules
Always select a variation before showing price

Never display a base product price

Disable WhatsApp CTA until a variation is selected

stock = 0 → show “Available on request”

8. Loading States
Prefer loading.tsx or Suspense

Skeletons must match final layout

9. Styling (Tailwind)
Mobile-first

Multi-line class strings

Group utilities logically

Use Tailwind config + design tokens

10. Naming Conventions
Components: PascalCase

Functions: camelCase

Constants: UPPER_SNAKE_CASE

Content: *_CONTENT

Booleans: is / has / should

❌ Common Anti-patterns
Querying Supabase directly from UI components

Hardcoding WhatsApp URLs

Sorting relations in SQL

Using API Routes for internal mutations

Hardcoding text or Tailwind classes

🎯 Skills (Auto-Loaded)
Data Layer: .github/skills/data-layer/SKILL.md

E-commerce: .github/skills/ecommerce/SKILL.md

Interactions: .github/skills/interactions/SKILL.md

Quality: .github/skills/quality/SKILL.md

📚 Reference Docs
Database schema → .github/reference/database-schema.md

Business rules → .github/reference/business-logic.md

Component patterns → .github/reference/component-patterns.md

Anti-patterns → .github/reference/anti-patterns.md

Content & styles → docs/CONTENT_AND_STYLE_MANAGEMENT.md

📖 Commit Conventions
Use Conventional Commits:

feat: add variation selector
fix: correct variation price sorting
refactor: extract whatsapp utilities
docs: update copilot instructions
✅ Quality Checklist
Before suggesting code, ensure:

 No any

 Server Component by default

 Correct Supabase client

 activo filter used

 Relations sorted in JS

 Centralized content & styles

 Loading & error states handled
```
