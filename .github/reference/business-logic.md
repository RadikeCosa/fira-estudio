---
title: "Business Logic Reference"
description: "Detailed business rules and workflows for Muma Estudio"
version: "1.0"
lastUpdated: "2026-01-16"
---

# Business Logic Reference

Complete business rules, workflows, and operational guidelines for Muma Estudio e-commerce.

---

## Product Lifecycle

### Product Creation Flow

```
Admin Action: Create New Product
         ↓
1. Create Product Base
   - nombre, slug, descripcion
   - categoria_id, tiempo_fabricacion
   - activo = false (draft)
         ↓
2. Upload Product Images
   - At least 1 image required
   - Mark one as es_principal = true
   - Set orden for display sequence
         ↓
3. Create Variations
   - At least 1 variation required
   - tamanio, color, precio, stock
   - Each combination must be unique
         ↓
4. Review & Activate
   - Set activo = true
   - Product appears in catalog
         ↓
5. Auto-Calculate precio_desde
   - System sets to MIN(variaciones.precio)
   - Updates on variation changes
```

**Validation Rules:**
- Product cannot be activated without at least 1 variation
- Product cannot be activated without at least 1 image
- Exactly one image must be marked as `es_principal = true`
- `slug` must be unique and URL-safe (lowercase, hyphens only)
- At least one variation must be active for product to show

---

### Product Update Flow

```
Admin Updates Product
         ↓
┌────────┴────────┐
│   Update Type   │
└────────┬────────┘
         ├─── Basic Info (nombre, descripcion, categoria)
         │    → Direct update, no side effects
         │
         ├─── Images (add, remove, reorder)
         │    → Ensure one es_principal = true
         │    → Update orden values
         │
         ├─── Variations (add, edit, remove)
         │    → Recalculate precio_desde
         │    → Check if any active variations remain
         │
         └─── Activation Status
              → If activo = false, hide from catalog
              → Keep variations intact (soft delete)
```

**Side Effects:**
- Adding/removing variations → recalculates `precio_desde`
- Deleting principal image → must set another as principal
- Deactivating product → does NOT deactivate variations (separate control)
- Deactivating all variations → product shows "No disponible"

---

### Product Deactivation Flow

**Soft Delete (Recommended):**
```sql
-- Deactivate product (keep data)
UPDATE productos SET activo = false WHERE id = 'product-uuid';

-- Result:
-- - Hidden from catalog
-- - URLs return 404
-- - Data preserved for reactivation
-- - Variations remain in database
```

**Hard Delete (Rare):**
```sql
-- Cascades to variaciones, imagenes_producto
DELETE FROM productos WHERE id = 'product-uuid';

-- Use only for:
-- - Test data cleanup
-- - Duplicate removal
-- - GDPR compliance
```

---

## Customer Journey (V1)

### Happy Path

```
User visits mumaestudio.com
         ↓
1. Home Page
   - Featured products (destacado = true)
   - Category navigation
   - Visual catalog preview
         ↓
2. Category Page (optional)
   - Filter by category slug
   - Products sorted: destacado DESC, nombre ASC
   - Grid layout (1/2/3/4 cols responsive)
         ↓
3. Product Detail Page
   - Product gallery (principal + thumbnails)
   - Variation selector (size → color)
   - Price updates based on selection
   - Stock indicator
   - WhatsApp button enabled
         ↓
4. Select Variation
   - Choose size (dropdown)
   - Choose color (dropdown, filtered by size)
   - Price and stock update dynamically
   - Button shows "Consultar por WhatsApp"
         ↓
5. Click WhatsApp Button
   - Opens wa.me/[number]?text=...
   - Pre-formatted message with:
     * Product name
     * Selected size
     * Selected color
     * Price
   - Opens in new tab/app
         ↓
6. WhatsApp Conversation
   - Customer asks questions
   - Admin responds manually
   - Sale closes outside platform
         ↓
7. Manual Order Processing (offline)
   - Admin updates stock in database
   - Admin arranges payment (transfer/cash)
   - Admin ships product
```

---

### Edge Cases

**Case 1: Product with No Active Variations**
```
Problem: Product.activo = true, but all Variacion.activo = false

Behavior:
- Product appears in listings
- Detail page shows selectors
- No variations available to select
- WhatsApp button disabled

Solution:
- Show message: "Producto sin variaciones disponibles"
- Hide WhatsApp button
- OR deactivate product automatically (future)
```

**Case 2: Selected Variation Goes Out of Stock**
```
Problem: User viewing product, variation stock becomes 0

Current Behavior (V1):
- Stock = 0 shows as "A pedido" (available on request)
- WhatsApp button still enabled
- Message mentions stock availability

Future Behavior (V2):
- Real-time stock updates
- Variation becomes unselectable
- Redirect to other variations
```

**Case 3: Product Slug Changes**
```
Problem: Admin changes product slug after URLs indexed

Risk:
- Broken external links
- Lost SEO rankings
- 404 errors

Solution (Future):
- Implement slug history table
- Create 301 redirects
- Warn admin before slug change
```

---

## Pricing Rules

### Price Display Logic

**Product Card (Listings):**
```typescript
// Show "Desde" prefix if multiple variations
const variacionesActivas = variaciones.filter(v => v.activo);

if (variacionesActivas.length > 1) {
  const precioMinimo = Math.min(...variacionesActivas.map(v => v.precio));
  display = `Desde $${precioMinimo.toLocaleString('es-AR')}`;
} else if (variacionesActivas.length === 1) {
  display = `$${variacionesActivas[0].precio.toLocaleString('es-AR')}`;
} else {
  display = "Consultar precio";
}
```

**Product Detail:**
```typescript
// Show exact price when variation selected
if (variacionSeleccionada) {
  display = `$${variacionSeleccionada.precio.toLocaleString('es-AR')}`;
} else {
  display = "Seleccione una variación";
}
```

---

### Price Formatting

**Rules:**
- Currency: ARS (Argentine Pesos)
- Format: `$15.000` (period as thousands separator)
- No decimals (prices stored as integers in cents)
- Locale: `es-AR`

**Implementation:**
```typescript
function formatPrice(precio: number): string {
  return `$${precio.toLocaleString('es-AR')}`;
}

// Examples:
formatPrice(15000)  → "$15.000"
formatPrice(150000) → "$150.000"
formatPrice(999)    → "$999"
```

---

### Tax and Legal Compliance

**Current (V1):**
- Prices shown are final (tax included)
- No invoice generation
- No formal checkout process

**Future (V2):**
- Integrate with AFIP (Argentine tax system)
- Generate electronic invoices
- Show price breakdown: subtotal + IVA
- Support tax-exempt customers

---

## Image Management

### Image Upload Flow

```
1. Admin Uploads Image
   ↓
2. Validation
   - File type: JPG, PNG, WebP
   - Max size: 5MB
   - Min dimensions: 800x800px
   - Aspect ratio: Square preferred
   ↓
3. Storage
   V1: /public/images/productos/{slug}/
   V2: Supabase Storage bucket
   ↓
4. Optimization
   - Next.js Image component auto-optimizes
   - Generates WebP versions
   - Creates responsive sizes
   ↓
5. Database Record
   INSERT INTO imagenes_producto
   - url: relative or full path
   - orden: next available number
   - es_principal: true if first image
```

---

### Image Ordering

**Rules:**
- Principal image (es_principal = true) shows first ALWAYS
- Other images ordered by `orden` field (ascending)
- Admin can drag-and-drop to reorder (future)

**Implementation:**
```typescript
// ⚠️ IMPORTANT: Order in JavaScript after fetch
// Supabase cannot order nested relations

data.forEach((producto) => {
  // Principal image first, then by orden
  producto.imagenes.sort((a, b) => {
    if (a.es_principal) return -1;
    if (b.es_principal) return 1;
    return a.orden - b.orden;
  });
});
```

---

### Principal Image Logic

**Business Rule:**
- Each product must have exactly ONE `es_principal = true` image
- Used for product cards, meta tags, social sharing

**Enforcement:**
```sql
-- Future: Database trigger
CREATE OR REPLACE FUNCTION ensure_single_principal_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.es_principal = true THEN
    UPDATE imagenes_producto
    SET es_principal = false
    WHERE producto_id = NEW.producto_id
      AND id != NEW.id
      AND es_principal = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Manual Fix:**
```sql
-- Reset all to false, then set one to true
UPDATE imagenes_producto SET es_principal = false WHERE producto_id = 'uuid';
UPDATE imagenes_producto SET es_principal = true WHERE id = 'image-uuid';
```

---

## Stock Management

### Stock Levels

**Interpretation:**
- `stock > 0` → Available, show exact count
- `stock = 0` → Available on request ("A pedido")
- `activo = false` → Not available (hidden)

**Display Logic:**
```typescript
function getStockMessage(variacion: Variacion): string {
  if (!variacion.activo) {
    return "No disponible";
  }
  
  if (variacion.stock === 0) {
    return "A pedido";
  }
  
  if (variacion.stock === 1) {
    return "1 disponible";
  }
  
  return `${variacion.stock} disponibles`;
}
```

---

### Stock Alerts (Future)

**Low Stock Warning:**
```typescript
const LOW_STOCK_THRESHOLD = 3;

if (variacion.stock <= LOW_STOCK_THRESHOLD && variacion.stock > 0) {
  showWarning = true;
  message = `¡Solo quedan ${variacion.stock}!`;
}
```

**Stock Reservation (V2):**
```
Cart Created → Reserve Stock
         ↓
15 min timer starts
         ↓
User Completes Payment → Deduct Stock
         ↓
OR Timer Expires → Release Stock
```

---

## Search & Filtering

### Current Implementation (V1)

**Available Filters:**
- By category: `/productos?categoria=manteles`
- By featured: `destacado = true` (shows first)
- By active: `activo = true` (implicit)

**Sorting:**
- Destacados first
- Then alphabetically by name
- No user-controlled sorting

---

### Future Enhancements (V2)

**Filters:**
- Price range: `precio >= min AND precio <= max`
- Color: `variaciones.color IN (...)`
- Size: `variaciones.tamanio IN (...)`
- Stock: `stock > 0` vs `stock = 0`
- Material: `material LIKE '%algodón%'`

**Full-Text Search:**
```sql
-- Add tsvector column
ALTER TABLE productos ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX idx_productos_search ON productos USING gin(search_vector);

-- Update on insert/update
CREATE TRIGGER productos_search_trigger
  BEFORE INSERT OR UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.spanish', nombre, descripcion);

-- Query
SELECT * FROM productos
WHERE search_vector @@ to_tsquery('spanish', 'mantel & rojo');
```

---

## SEO Rules

### URL Structure

**Pattern:**
```
/                            → Home page
/productos                   → All products
/productos/{categoria-slug}  → Category page
/productos/{producto-slug}   → Product detail
```

**Rules:**
- All lowercase
- Hyphens for spaces (not underscores)
- No special characters
- Max 60 characters
- Descriptive and unique

**Examples:**
```
✅ /productos/mantel-floral-rojo
✅ /productos/servilleta-algodon-azul
❌ /productos/Mantel_Floral_ROJO
❌ /productos/producto-123
❌ /productos/mantel-artesanal-hecho-a-mano-100-algodon-premium-calidad-superior
```

---

### Meta Tags

**Product Detail Page:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const producto = await getProductoBySlug(params.slug);
  
  if (!producto) {
    return { title: 'Producto no encontrado' };
  }
  
  const imagenPrincipal = producto.imagenes.find(i => i.es_principal);
  const precioDesde = Math.min(...producto.variaciones.map(v => v.precio));
  
  return {
    title: `${producto.nombre} | Muma Estudio`,
    description: producto.descripcion.slice(0, 160),
    keywords: [producto.nombre, producto.categoria?.nombre, 'textiles', 'artesanal'],
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion,
      images: [imagenPrincipal?.url],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: producto.nombre,
      description: producto.descripcion,
      images: [imagenPrincipal?.url],
    },
  };
}
```

---

### Structured Data (JSON-LD)

**Product Schema:**
```tsx
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": producto.nombre,
  "description": producto.descripcion,
  "image": producto.imagenes.map(i => i.url),
  "brand": {
    "@type": "Brand",
    "name": "Muma Estudio"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "ARS",
    "lowPrice": Math.min(...producto.variaciones.map(v => v.precio)),
    "highPrice": Math.max(...producto.variaciones.map(v => v.precio)),
    "offerCount": producto.variaciones.filter(v => v.activo).length,
    "availability": "https://schema.org/InStock"
  }
};
```

---

## Error Handling

### 404 - Product Not Found

**Triggers:**
- Invalid slug
- Product exists but `activo = false`
- Database error returns null

**Response:**
```tsx
// app/productos/[slug]/page.tsx
const producto = await getProductoBySlug(slug);

if (!producto) {
  notFound(); // Triggers not-found.tsx
}
```

**not-found.tsx:**
```tsx
export default function NotFound() {
  return (
    <div>
      <h1>Producto no encontrado</h1>
      <p>El producto que buscás no existe o ya no está disponible.</p>
      <Link href="/productos">Ver todos los productos</Link>
    </div>
  );
}
```

---

### Database Errors

**Query Failure:**
```typescript
export async function getProductos(): Promise<ProductoCompleto[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("productos")
    .select("*, categoria:categorias(*), variaciones(*), imagenes:imagenes_producto(*)");
  
  if (error) {
    console.error("Database error:", error);
    throw error; // Caught by error.tsx
  }
  
  return data ?? [];
}
```

**Error Boundary:**
```tsx
// app/productos/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h1>Error al cargar productos</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  );
}
```

---

### Image Loading Failures

**Fallback Image:**
```tsx
<Image
  src={imagen.url}
  alt={producto.nombre}
  width={800}
  height={800}
  onError={(e) => {
    e.currentTarget.src = '/images/placeholders/producto-sin-imagen.jpg';
  }}
/>
```

---

## Performance Rules

### Caching Strategy

**Server Components (Next.js 15):**
```typescript
// Page-level revalidation
export const revalidate = 3600; // 1 hour

export default async function ProductosPage() {
  const productos = await getProductos(); // Cached automatically
  return <ProductGrid productos={productos} />;
}
```

**On-Demand Revalidation:**
```typescript
// In admin panel or after product update
import { revalidatePath } from 'next/cache';

export async function updateProducto(id: string, data: Partial<Producto>) {
  // Update database
  await supabase.from('productos').update(data).eq('id', id);
  
  // Revalidate affected paths
  revalidatePath('/productos');
  revalidatePath('/'); // Home page if featured
}
```

---

### Image Optimization

**Next.js Image Component:**
```tsx
// Product card (lazy load)
<Image
  src={imagen.url}
  alt={producto.nombre}
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading="lazy"
/>

// Principal image (priority load)
<Image
  src={imagenPrincipal.url}
  alt={producto.nombre}
  width={800}
  height={800}
  priority
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

---

### Query Optimization

**Avoid N+1 Queries:**
```typescript
// ❌ BAD: Separate queries
const productos = await getProductos();
for (const producto of productos) {
  producto.categoria = await getCategoriaById(producto.categoria_id);
  producto.variaciones = await getVariacionesByProductoId(producto.id);
}

// ✅ GOOD: Single query with joins
const { data } = await supabase
  .from("productos")
  .select(`
    *,
    categoria:categorias(*),
    variaciones(*),
    imagenes:imagenes_producto(*)
  `);
```

---

## Future V2 Features

### Shopping Cart

**Data Structure:**
```typescript
interface CarritoItem {
  id: string; // client-side UUID
  producto_id: string;
  variacion_id: string;
  cantidad: number;
  precio_unitario: number; // Snapshot at add-to-cart time
}

interface Carrito {
  items: CarritoItem[];
  total: number;
  created_at: Date;
  expires_at: Date; // 15 min reservation
}
```

**Storage:**
- Client-side: Context API + localStorage
- Server-side: Database table for authenticated users

---

### Order Management

**Order Lifecycle:**
```
Cart → Checkout → Payment → Confirmed → Shipped → Delivered
                    ↓
                 Failed → Cart Restored
```

**Database Tables:**
```sql
CREATE TABLE pedidos (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  estado VARCHAR(50), -- 'pending', 'paid', 'shipped', 'delivered'
  total INTEGER,
  created_at TIMESTAMPTZ
);

CREATE TABLE pedidos_items (
  id UUID PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id),
  producto_id UUID,
  variacion_id UUID,
  cantidad INTEGER,
  precio_unitario INTEGER
);
```

---

### User Accounts

**Features:**
- Email/password authentication
- Order history
- Saved addresses
- Wishlist

**Implementation:**
```typescript
// Supabase Auth
import { createClient } from '@/lib/supabase/client';

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});
```

---

### Admin Panel

**Features:**
- CRUD products, variations, images
- Order management
- Stock updates
- Analytics dashboard

**Access Control:**
```typescript
// Middleware
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.role !== 'admin') {
    return NextResponse.redirect('/');
  }
  
  return NextResponse.next();
}
```

---

## Monitoring & Analytics

### Key Metrics

**Performance:**
- Core Web Vitals (LCP, CLS, FID)
- Time to First Byte (TTFB)
- Server response time
- Image load time

**Business:**
- Products viewed
- WhatsApp button clicks
- Top categories
- Search queries (future)

**Technical:**
- Error rate
- Database query time
- Cache hit rate
- Build time

---

### Error Tracking

**Sentry Integration (Future):**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Automatic error capture in error boundaries
```

---

## Compliance & Legal

### Privacy Policy

**Data Collection (V1):**
- No user accounts
- No cookies (except Next.js functional)
- No tracking scripts
- WhatsApp interactions outside platform

**Data Collection (V2):**
- User accounts (email, name, address)
- Order history
- Payment information (via Mercado Pago)
- Analytics (anonymized)

---

### Terms of Service

**Key Points:**
- Prices in ARS, subject to change
- Products made to order (tiempo_fabricacion)
- Exchange/return policy
- Shipping costs and times
- Payment methods accepted

---

## Reference Checklist

Before implementing a feature, verify:

- [ ] Database schema updated (if needed)
- [ ] Types updated in `lib/types.ts`
- [ ] Query functions created/updated
- [ ] Server vs Client component determined
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] TypeScript types explicit (no `any`)
- [ ] Images optimized with Next.js Image
- [ ] Mobile-responsive design
- [ ] Accessibility (ARIA labels, alt text)
- [ ] SEO metadata complete
- [ ] Performance tested (Lighthouse)
- [ ] Security validated (no XSS, SQL injection)

---

## Related Documentation

- Database Schema: `.github/reference/database-schema.md`
- Core Instructions: `.github/instructions/copilot-instructions.instructions.md`
- Supabase Queries: `.github/skills/supabase-queries/SKILL.md`
- WhatsApp Integration: `.github/skills/whatsapp-integration/SKILL.md`
- Product Variations: `.github/skills/product-variations/SKILL.md`
