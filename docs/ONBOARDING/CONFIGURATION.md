# Configuration & Standards - Onboarding Guide

**Última actualización:** 29 de enero de 2026  
**Proyecto:** Challaco - Textile E-commerce  
**Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4

---

## Índice

1. [Package.json - Scripts y Dependencias](#packagejson)
2. [TypeScript Configuration](#typescript-configuration)
3. [Next.js Configuration](#nextjs-configuration)
4. [ESLint Configuration](#eslint-configuration)
5. [Vitest Configuration](#vitest-configuration)
6. [PostCSS & Tailwind](#postcss--tailwind)
7. [Environment Variables](#environment-variables)
8. [Estándares de Código](#estándares-de-código)

---

## Package.json

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia dev server en http://localhost:3000

# Build & Deploy
npm run build            # Build de producción
npm start                # Inicia servidor de producción

# Linting
npm run lint             # Ejecuta ESLint en todo el proyecto

# Testing
npm test                 # Ejecuta todos los tests (Node.js + React)
npm run test:node        # Tests de Node.js (lib utilities)
npm run test:unit        # Tests de React (components)
npm run test:watch       # Modo watch para desarrollo
npm run test:coverage    # Genera reporte de cobertura
```

### Dependencias Principales

#### Framework & Core

```json
"next": "^16.0.10"           // Next.js App Router
"react": "19.2.1"            // React 19 con RSC
"react-dom": "19.2.1"        // React DOM
```

**Next.js 16 Features:**

- App Router estable
- Server Components por defecto
- Server Actions
- Streaming SSR
- Turbopack (experimental)

#### Database & Auth

```json
"@supabase/supabase-js": "^2.90.1"  // Cliente de Supabase
"@supabase/ssr": "^0.8.0"           // SSR helpers para Next.js
```

**Configuración:**

- PostgreSQL database
- Row Level Security (RLS)
- Auth deshabilitado (no hay login por ahora)
- Tablas: productos, variaciones, imagenes_producto, categorias, consultas

#### Styling

```json
"tailwindcss": "^4"                    // Tailwind CSS v4
"@tailwindcss/postcss": "^4"           // PostCSS plugin
"class-variance-authority": "^0.7.1"   // CVA para variantes
"clsx": "^2.1.1"                       // Conditional classes
"tailwind-merge": "^3.4.0"             // Merge Tailwind classes
```

**Design System:**

- Tokens centralizados en `lib/design/tokens.ts`
- CVA para componentes con variantes (Button, Badge)
- Custom utilities en `lib/utils/styles.ts`

#### UI & Icons

```json
"lucide-react": "^0.562.0"  // Icons library (Tree-shakeable)
```

**Iconos usados:**

- Menu, X (mobile nav)
- ShoppingCart, Heart, User (e-commerce)
- Mail, Phone, Instagram (contacto)
- ChevronLeft, ChevronRight (carousels)

#### Analytics & Performance

```json
"@next/third-parties": "^16.1.3"      // Google Analytics helpers
"@vercel/speed-insights": "^1.3.1"    // Vercel Speed Insights
```

**Analytics Setup:**

- Google Analytics 4 (gtag.js)
- Custom events: product_view, variation_select, whatsapp_click
- Production only (dev no trackea)

### DevDependencies

#### Testing

```json
"vitest": "^2.1.9"                          // Test runner
"@vitejs/plugin-react": "^4.7.0"           // React plugin
"@testing-library/react": "^16.3.1"        // React Testing Library
"@testing-library/jest-dom": "^6.9.1"      // Custom matchers
"@vitest/ui": "^2.1.9"                     // UI for tests
"jsdom": "^25.0.1"                         // DOM simulation
```

#### TypeScript

```json
"typescript": "^5"           // TypeScript 5
"@types/node": "^20"
"@types/react": "^19"
"@types/react-dom": "^19"
"tsx": "^4.19.1"             // Node.js TypeScript runner
```

#### Linting

```json
"eslint": "^9"                          // ESLint v9
"eslint-config-next": "16.0.10"         // Next.js ESLint rules
```

---

## TypeScript Configuration

### tsconfig.json

```jsonc
{
  "compilerOptions": {
    // Target & Libs
    "target": "ES2017", // Node 18+ compatibility
    "lib": ["dom", "dom.iterable", "esnext"],

    // Module System
    "module": "esnext",
    "moduleResolution": "bundler", // Next.js bundler mode
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // JSX
    "jsx": "react-jsx", // React 19 transform

    // Type Checking
    "strict": true, // ✅ Strict mode ON
    "allowJs": true,
    "skipLibCheck": true,
    "noEmit": true,

    // Next.js
    "incremental": true,
    "plugins": [{ "name": "next" }],

    // Path Aliases
    "paths": {
      "@/*": ["./*"], // @ = project root
    },
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mts",
    ".next/types/**/*.ts",
  ],
  "exclude": ["node_modules"],
}
```

### Strict Mode Features

Con `"strict": true`, se habilitan:

- ✅ `strictNullChecks` - No permite null/undefined implícitos
- ✅ `strictFunctionTypes` - Verifica tipos de funciones
- ✅ `strictBindCallApply` - Tipos correctos en bind/call/apply
- ✅ `strictPropertyInitialization` - Props de clase inicializadas
- ✅ `noImplicitAny` - No permite `any` implícito
- ✅ `noImplicitThis` - `this` debe tener tipo explícito

**Impacto en el código:**

```typescript
// ❌ Error con strict mode
function getPrice(producto: Producto) {
  return producto.precio_desde.toFixed(2); // Error: puede ser null
}

// ✅ Correcto
function getPrice(producto: Producto) {
  return producto.precio_desde?.toFixed(2) ?? "Consultar";
}
```

### Path Aliases

```typescript
// Usando @ para imports desde root
import { Button } from "@/components/ui/Button";
import { Producto } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { COLORS } from "@/lib/design/tokens";

// ❌ Evitar relative paths largos
import { Button } from "../../../components/ui/Button";
```

---

## Next.js Configuration

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // Permite Supabase Storage
      },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // DNS Prefetch
          { key: "X-DNS-Prefetch-Control", value: "on" },

          // HTTPS Enforcement
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Content Security
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },

          // CSP (Content Security Policy)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com",
              "frame-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/",
        permanent: false,
      },
    ];
  },
};
```

### Image Optimization

**Remote Patterns:**

- Permite imágenes de Supabase Storage
- Pattern: `https://*.supabase.co/*`
- Incluye: proyectos de desarrollo y producción

**Next.js Image Component:**

```typescript
import Image from "next/image";

<Image
  src={imagenUrl}
  alt="Descripción"
  fill                    // Llena el contenedor
  sizes="(max-width: 640px) 100vw, 50vw"  // Responsive
  loading="lazy"          // Lazy loading
  className="object-cover"
/>
```

### Security Headers Explicados

#### Strict-Transport-Security (HSTS)

- Fuerza HTTPS por 2 años
- Incluye subdominios
- Preload en navegadores

#### X-Content-Type-Options

- Previene MIME sniffing
- Navegadores respetan Content-Type

#### X-Frame-Options

- Permite frames solo del mismo origen
- Previene clickjacking

#### Content-Security-Policy (CSP)

- **default-src 'self'**: Solo contenido del mismo origen
- **script-src**: Scripts propios + Google Analytics + inline (React)
- **style-src**: Estilos propios + inline (Tailwind) + Google Fonts
- **img-src**: Imágenes propias + data URIs + HTTPS + blob
- **connect-src**: APIs propias + Supabase + Analytics
- **frame-src 'none'**: No permite iframes

---

## ESLint Configuration

### eslint.config.mjs

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals, // Core Web Vitals rules
  ...nextTs, // TypeScript rules
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

### Reglas Principales

#### Next.js Core Web Vitals

- ✅ `@next/next/no-img-element` - Usa `<Image>` en lugar de `<img>`
- ✅ `@next/next/no-html-link-for-pages` - Usa `<Link>` para rutas internas
- ✅ `@next/next/no-sync-scripts` - Scripts async
- ✅ `@next/next/google-font-display` - Font display correcto

#### TypeScript

- ✅ `@typescript-eslint/no-unused-vars` - No variables sin usar
- ✅ `@typescript-eslint/no-explicit-any` - Evitar `any`
- ✅ `@typescript-eslint/no-non-null-assertion` - Evitar `!` operator

### Ejecutar ESLint

```bash
# Lint todo el proyecto
npm run lint

# Fix automático
npm run lint -- --fix

# Lint archivo específico
npx eslint components/productos/ProductCard.tsx
```

---

## Vitest Configuration

### vitest.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // globals like describe, it, expect
    environment: "jsdom", // DOM simulation
    setupFiles: "./vitest.setup.ts",

    // Incluir tests
    include: [
      "components/**/*.test.tsx",
      "app/**/*.test.tsx",
      "hooks/**/*.test.ts",
    ],

    // Excluir
    exclude: ["node_modules/**", ".next/**", "out/**"],

    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.config.{ts,js}",
        "**/types.ts",
      ],
    },
  },

  // Path aliases (igual que tsconfig)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### vitest.setup.ts

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (para responsive tests)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Test Patterns

#### Component Tests

```typescript
// components/ui/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Node Tests (lib utilities)

```typescript
// lib/utils/format.test.ts
import { describe, it, expect } from "node:test";
import assert from "node:assert/strict";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats price with AR locale", () => {
    const result = formatPrice(15000);
    assert.equal(result, "$15.000");
  });
});
```

---

## PostCSS & Tailwind

### postcss.config.mjs

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // Tailwind CSS v4 plugin
  },
};
```

**Tailwind v4 Features:**

- Sin archivo `tailwind.config.js` (opcional)
- CSS-first configuration
- PostCSS plugin nativo
- Performance mejorado

### Tailwind Setup

#### globals.css

```css
@import "tailwindcss";

/* Custom CSS variables */
:root {
  --foreground: #1a1a1a;
  --background: #ffffff;
  --muted: #6b7280;
  /* ... */
}
```

#### Design Tokens

En lugar de Tailwind config, usamos tokens TypeScript:

```typescript
// lib/design/tokens.ts
export const COLORS = {
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground",
  },
  background: {
    primary: "bg-white",
    secondary: "bg-muted",
  },
};
```

**Ventajas:**

- ✅ Type-safe
- ✅ Autocomplete
- ✅ Centralizados
- ✅ Fácil de cambiar

---

## Environment Variables

### Variables Requeridas

```bash
# .env.local (Git-ignored)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Analytics (opcional, production only)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# WhatsApp (opcional)
NEXT_PUBLIC_WHATSAPP_NUMBER=+5491123456789
```

### Convenciones

- ✅ `NEXT_PUBLIC_*` - Variables expuestas al cliente
- ✅ Sin prefijo - Variables solo del servidor
- ✅ `.env.local` - Nunca commitear
- ✅ `.env.example` - Template para equipo

### Uso en Código

```typescript
// Cliente (browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Servidor (Node.js)
const secretKey = process.env.SECRET_KEY;
```

---

## Estándares de Código

### Nomenclatura

#### Archivos

- **PascalCase**: Componentes React (`ProductCard.tsx`)
- **camelCase**: Utilities (`formatPrice.ts`)
- **kebab-case**: CSS/config (`eslint.config.mjs`)

#### Variables y Funciones

```typescript
// ✅ camelCase
const precioTotal = 15000;
function calcularDescuento() {}

// ✅ PascalCase para componentes
function ProductCard() {}

// ✅ UPPER_CASE para constantes
const API_URL = "https://api.example.com";
const MAX_RETRIES = 3;
```

#### Types e Interfaces

```typescript
// ✅ PascalCase
interface ProductCardProps {}
type Variacion = {};
```

### Imports Order

```typescript
// 1. React y Next.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. Tipos
import type { Producto, Variacion } from "@/lib/types";

// 3. Componentes externos
import { Card } from "@/components/ui/Card";

// 4. Utilidades
import { formatPrice } from "@/lib/utils";

// 5. Estilos/tokens
import { COLORS } from "@/lib/design/tokens";
```

### Comments

```typescript
/**
 * JSDoc para funciones públicas
 * @param producto - Product data
 * @returns Formatted price string
 */
export function formatPrice(producto: Producto): string {
  // Inline comments para lógica compleja
  const precio = producto.precio_desde ?? 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(precio);
}
```

### Async/Await

```typescript
// ✅ Preferir async/await
async function getProducto(slug: string) {
  try {
    const producto = await supabase
      .from("productos")
      .select("*")
      .eq("slug", slug)
      .single();
    return producto;
  } catch (error) {
    console.error("Error fetching producto:", error);
    return null;
  }
}

// ❌ Evitar .then()
function getProducto(slug: string) {
  return supabase
    .from("productos")
    .select("*")
    .eq("slug", slug)
    .single()
    .then((response) => response.data);
}
```

### Error Handling

```typescript
// ✅ Try-catch para async
try {
  const result = await fetchData();
  processResult(result);
} catch (error) {
  if (error instanceof CustomError) {
    handleCustomError(error);
  } else {
    console.error("Unexpected error:", error);
  }
}

// ✅ Null checks con optional chaining
const precio = producto?.variaciones?.[0]?.precio ?? 0;
```

---

## Git Workflow

### Branch Strategy

```bash
main              # Production
├── develop       # Development
└── feat/carrito  # Feature branches
```

### Commit Messages

```bash
# Format: <type>: <description>

feat: add product view tracking
fix: resolve MobileNav z-index issue
refactor: split ContactForm into smaller components
docs: add components onboarding guide
test: add ProductCard tests
style: format code with prettier
chore: update dependencies
```

**Types:**

- `feat` - Nueva feature
- `fix` - Bug fix
- `refactor` - Refactorización sin cambios funcionales
- `docs` - Documentación
- `test` - Tests
- `style` - Formatting
- `chore` - Mantenimiento

---

## Resources

### Documentos Relacionados

- [Components Onboarding](./COMPONENTS.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Data & Queries](./DATA_AND_QUERIES.md)

### Links Útiles

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vitest Docs](https://vitest.dev)
- [Supabase Docs](https://supabase.com/docs)

---

**Última actualización:** 29 de enero de 2026  
**Mantenido por:** Equipo de desarrollo Challaco
