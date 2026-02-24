# Fira Estudio — Copilot Instructions

E-commerce de textiles artesanales (manteles, servilletas, caminos de mesa).
Stack: Next.js 14+ App Router · TypeScript strict · Supabase PostgreSQL · Tailwind CSS · Vercel.

## Estructura del proyecto

```
app/                  # Pages y layouts (App Router)
components/
├── layout/           # Header, Footer, MobileNav
├── productos/        # ProductCard, ProductGallery, VariationSelector
├── carrito/          # CartDrawer, CartBadge, AddToCartButton
└── ui/               # Primitivos reutilizables
lib/
├── content/          # Texto centralizado: home.ts, carrito.ts, etc.
├── design/tokens.ts  # Design tokens: COLORS, TYPOGRAPHY, SPACING, COMPONENTS
├── supabase/         # server.ts, client.ts, queries.ts
├── repositories/     # ProductoRepository
├── context/          # CarritoContext.tsx
├── storage/          # carrito.ts (localStorage), rate-limit.ts
├── analytics/        # gtag.ts
└── types.ts          # Tipos compartidos
hooks/                # useScrollLock, useEscapeKey, useRateLimit
```

## Modelo de datos clave

- **Precios viven en `variaciones`**, no en productos base
- **`stock = 0`** = disponible bajo pedido, NO es out of stock
- **`precio_desde`** en productos = mínimo de variaciones (solo para listados)
- **`activo`** es la columna de visibilidad (nunca `disponible`)
- Cada producto tiene N variaciones (tamaño × color), N imágenes, 1 categoría

## Reglas globales

- Nunca usar `any`; tipos explícitos en parámetros y retorno
- `interface` para modelos de dominio, `type` para unions/utilidades
- Propiedades de negocio en español, código y comentarios en inglés
- **Server Component por defecto**; `"use client"` solo cuando sea imprescindible
- Texto hardcodeado → importar de `lib/content/*.ts`
- Clases Tailwind repetidas → importar de `lib/design/tokens.ts`
- Imports con alias `@/`, nunca rutas relativas con `../`

## Source of Truth (obligatorio)

Al responder o proponer cambios, usar este orden de verdad:

1. **Código ejecutable y config real**
   - `package.json`
   - `next.config.ts`
   - `vitest.config.ts`
   - `tsconfig.json`
2. **Implementación en `app/`, `components/`, `lib/`, `hooks/`**
3. **Documentación**
   - Si un doc contradice al código, **gana el código**.
   - Proponer patch de doc en el mismo PR.

## Reglas de consistencia automática

- **No hardcodear versiones** (Next.js/React/TS) en respuestas si no coinciden con `package.json`.
- Para testing, tratar Vitest como activo si existe `vitest.config.ts` y tests `*.test.*`.
- Para mantenimiento/checkout, usar nombres canónicos:
  - `NEXT_PUBLIC_MAINTENANCE_MODE`
  - `NEXT_PUBLIC_CHECKOUT_ENABLED`
- Para SQL scripts, usar ruta canónica `scripts/sql-code/` (no `scripts/sql-code/` en raíz).
- Para URLs de checkout/webhook, referenciar config centralizada en `lib/config/urls.ts` (ej: `CHECKOUT_URLS`, `WEBHOOK_URL`, `SITE_URL`).

## Policy de actualización de docs

Si se detecta drift:
1. Reportar archivo desactualizado.
2. Proponer diff mínimo.
3. Priorizar docs operativos:
   - deployment/env/testing/maintenance/webhook.

## Checklist antes de cerrar una tarea

- [ ] Versiones en docs alineadas con `package.json`
- [ ] Comandos de test/build/lint alineados con `package.json`
- [ ] Variables de entorno consistentes en todos los docs
- [ ] Paths de scripts/SQL consistentes con árbol real
- [ ] Ejemplos de código compilables con config actual