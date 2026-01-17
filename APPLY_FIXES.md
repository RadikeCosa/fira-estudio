# How to Apply Fixes to deb/analytics Branch

## Context
The `deb/analytics` branch had critical syntax errors from a corrupted merge. All issues have been identified and fixed locally, but the fixes need to be pushed to the remote repository.

## Current Status
- ✅ All fixes completed in local `deb/analytics` branch (commit `4d6c3fa`)
- ⏳ Fixes need to be pushed to GitHub
- ⏳ Branch ready for merge after push

## Files Fixed (7 files)

1. **app/productos/[slug]/page.tsx**
   - Fixed corrupted imports at beginning of file
   - Added missing `SITE_CONFIG` import
   - Added RelatedProducts component at end

2. **app/productos/page.tsx**
   - Completely rewrote to fix merge corruption
   - Added category filtering functionality
   - Fixed interface and props

3. **components/productos/RelatedProducts.tsx**
   - Removed duplicated code
   - Fixed prop types (string instead of number)
   - Proper async server component implementation

4. **lib/analytics/gtag.ts**
   - Added TypeScript declarations for `window.gtag`

5. **lib/supabase/queries.ts**
   - Added missing type imports (Variacion, ImagenProducto)

6. **app/sitemap.ts**
   - Fixed type errors (removed `updated_at`, added `as const`)

7. **.env.local.example**
   - Added `NEXT_PUBLIC_GA_MEASUREMENT_ID` example

## How to Apply the Fixes

### Option 1: Cherry-pick the fix commit
```bash
# Switch to deb/analytics branch
git checkout deb/analytics

# Cherry-pick the fix commit from local branch
git cherry-pick 4d6c3fa

# Push to remote
git push origin deb/analytics
```

### Option 2: Apply the fixes manually
If you're unable to access the local commit, here are the key changes:

#### 1. Fix app/productos/[slug]/page.tsx
The file should start with clean imports:
```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductoBySlug } from "@/lib/supabase/queries";
import { ProductGallery } from "@/components/productos/ProductGallery";
import { ProductInfo } from "@/components/productos/ProductInfo";
import { ProductActions } from "@/components/productos/ProductActions";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RelatedProducts from "@/components/productos/RelatedProducts";
import { generateProductSchema } from "@/lib/seo/structured-data";
import { SITE_CONFIG } from "@/lib/constants";
```

And add RelatedProducts before closing `</main>`:
```typescript
          </div>
          
          {/* Productos Relacionados */}
          <RelatedProducts
            productoId={producto.id}
            categoriaId={producto.categoria_id}
          />
        </div>
      </main>
```

#### 2. Fix app/productos/page.tsx
Replace entire file with properly structured version (see ANALYTICS_REVIEW.md)

#### 3. Fix components/productos/RelatedProducts.tsx
Props should be:
```typescript
interface RelatedProductsProps {
  productoId: string;  // Not number
  categoriaId?: string | null;  // Not number
}
```

And call should be:
```typescript
const productos = await getProductosRelacionados(
  productoId,
  categoriaId ?? null,
  4
);
```

#### 4. Add to lib/analytics/gtag.ts (after imports):
```typescript
declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
```

#### 5. Update lib/supabase/queries.ts imports:
```typescript
import type {
  Categoria,
  ProductoCompleto,
  Variacion,
  ImagenProducto,
} from "@/lib/types";
```

And add types to sort functions:
```typescript
p.variaciones.sort((a: Variacion, b: Variacion) => a.precio - b.precio);
p.imagenes.sort((a: ImagenProducto, b: ImagenProducto) => a.orden - b.orden);
```

#### 6. Fix app/sitemap.ts:
Change:
```typescript
lastModified: new Date(p.updated_at || p.created_at),
changeFrequency: "weekly",
```

To:
```typescript
lastModified: new Date(p.created_at),
changeFrequency: "weekly" as const,
```

#### 7. Add to .env.local.example:
```bash
# Google Analytics Measurement ID (GA4)
# Example: G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Verification

After applying fixes, verify:
```bash
# TypeScript compilation
npx tsc --noEmit
# Should output: No errors

# Build
npm run build
# Should complete (ignore font warnings)
```

## Then Merge to Main
Once fixes are pushed and verified:
```bash
git checkout main
git merge deb/analytics
git push origin main
```

## Questions?
See `ANALYTICS_REVIEW.md` for detailed analysis of all changes.
