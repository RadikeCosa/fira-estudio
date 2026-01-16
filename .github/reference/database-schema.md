---
title: "Database Schema Reference"
description: "Complete Supabase database schema for Muma Estudio"
version: "1.0"
lastUpdated: "2026-01-16"
---

# Database Schema Reference

Complete PostgreSQL schema documentation for Muma Estudio's Supabase database.

## Tables Overview

- **categorias** - Product categories (manteles, servilletas, etc.)
- **productos** - Base product information
- **variaciones** - Product variations (size, color, price, stock)
- **imagenes_producto** - Product images with ordering
- **consultas** - Customer inquiries (future use)

---

## Detailed Table Definitions

### Table: `categorias`

Product categories for organizing textile products.

```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_orden ON categorias(orden);
```

**Business Rules:**
- `slug` must be unique and URL-safe (lowercase, hyphens only)
- `orden` determines display order in navigation (lower = first)
- Categories cannot be deleted if products reference them

**Example Data:**
```sql
INSERT INTO categorias (nombre, slug, orden) VALUES
  ('Manteles', 'manteles', 1),
  ('Servilletas', 'servilletas', 2),
  ('Caminos de Mesa', 'caminos-de-mesa', 3);
```

---

### Table: `productos`

Base product information (without specific size/color/price).

```sql
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  precio_desde INTEGER,
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  tiempo_fabricacion VARCHAR(50) NOT NULL DEFAULT 'Consultar',
  material TEXT,
  cuidados TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_destacado ON productos(destacado);
CREATE INDEX idx_productos_categoria_activo ON productos(categoria_id, activo);
```

**Business Rules:**
- `slug` must be unique and URL-safe
- `activo = false` hides product from catalog (soft delete)
- `destacado = true` shows product first in listings
- `precio_desde` is calculated from minimum variation price (can be NULL)
- Deleting a category sets `categoria_id` to NULL (not deleted)

**Important Fields:**
- `tiempo_fabricacion` - Manufacturing time (e.g., "2-3 días hábiles")
- `material` - Fabric material description (e.g., "100% algodón")
- `cuidados` - Care instructions (e.g., "Lavar a máquina, 30°C")

---

### Table: `variaciones`

Product variations with specific size, color, price, and stock.

```sql
CREATE TABLE variaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tamanio VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  precio INTEGER NOT NULL CHECK (precio > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku VARCHAR(50) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_producto_tamanio_color UNIQUE (producto_id, tamanio, color)
);

CREATE INDEX idx_variaciones_producto ON variaciones(producto_id);
CREATE INDEX idx_variaciones_producto_activo ON variaciones(producto_id, activo);
CREATE INDEX idx_variaciones_sku ON variaciones(sku);
```

**Business Rules:**
- Each combination of `producto_id + tamanio + color` must be unique
- `precio` is stored in cents (e.g., 15000 = $15,000 ARS)
- `stock = 0` means "available on request" (not out of stock)
- `activo = false` hides variation from selector
- Deleting a product cascades to delete all variations
- `sku` is optional but must be unique if provided

**Example Data:**
```sql
INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, activo) VALUES
  ('prod-uuid-1', '150x200cm', 'Rojo', 15000, 5, true),
  ('prod-uuid-1', '150x200cm', 'Azul', 15000, 3, true),
  ('prod-uuid-1', '180x250cm', 'Rojo', 18500, 2, true),
  ('prod-uuid-1', '180x250cm', 'Azul', 18500, 0, false); -- No stock, inactive
```

---

### Table: `imagenes_producto`

Product images with ordering and principal image flag.

```sql
CREATE TABLE imagenes_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_imagenes_producto ON imagenes_producto(producto_id);
CREATE INDEX idx_imagenes_orden ON imagenes_producto(producto_id, orden);
CREATE INDEX idx_imagenes_principal ON imagenes_producto(producto_id, es_principal);
```

**Business Rules:**
- Each product should have exactly one `es_principal = true` image
- `orden` determines display order (lower = first)
- `url` can be relative path (e.g., "/images/productos/...") or full URL
- `alt_text` should describe the image for accessibility
- Deleting a product cascades to delete all images

**Important Notes:**
- Images are sorted in JavaScript after fetching (Supabase limitation with joins)
- Principal image is used for product cards and meta tags
- Images can be shared between variations or specific to one

---

### Table: `consultas`

Customer inquiries (currently unused in V1, prepared for future).

```sql
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  respondida BOOLEAN DEFAULT false,
  respuesta TEXT
);

CREATE INDEX idx_consultas_email ON consultas(email);
CREATE INDEX idx_consultas_respondida ON consultas(respondida);
CREATE INDEX idx_consultas_created ON consultas(created_at DESC);
```

**Business Rules:**
- `producto_id` is optional (general inquiries have NULL)
- `respondida` tracks if admin has replied
- Currently not used in V1 (all inquiries go through WhatsApp)

---

## Relationships Diagram

```
┌─────────────────┐
│   categorias    │
│─────────────────│
│ id (PK)         │
│ nombre          │
│ slug (UNIQUE)   │
└────────┬────────┘
         │
         │ 1:N (categoria_id)
         ▼
┌─────────────────┐
│   productos     │──────────────┐
│─────────────────│              │
│ id (PK)         │              │ 1:N
│ nombre          │              │
│ slug (UNIQUE)   │              ▼
│ categoria_id    │      ┌──────────────────┐
│ activo          │      │   variaciones    │
│ destacado       │      │──────────────────│
└────────┬────────┘      │ id (PK)          │
         │               │ producto_id (FK) │
         │ 1:N           │ tamanio          │
         ▼               │ color            │
┌────────────────────┐   │ precio           │
│ imagenes_producto  │   │ stock            │
│────────────────────│   │ activo           │
│ id (PK)            │   └──────────────────┘
│ producto_id (FK)   │
│ url                │
│ orden              │
│ es_principal       │
└────────────────────┘
```

---

## TypeScript Types

These interfaces in `lib/types.ts` map to the database schema:

```typescript
/** Category */
export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  orden: number;
}

/** Base Product */
export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoria_id: string | null;
  precio_desde: number | null;
  destacado: boolean;
  activo: boolean;
  tiempo_fabricacion: string;
  material: string | null;
  cuidados: string | null;
  created_at: string;
}

/** Product Variation */
export interface Variacion {
  id: string;
  producto_id: string;
  tamanio: string;
  color: string;
  precio: number;
  stock: number;
  sku: string | null;
  activo: boolean;
}

/** Product Image */
export interface ImagenProducto {
  id: string;
  producto_id: string;
  url: string;
  alt_text: string | null;
  orden: number;
  es_principal: boolean;
}

/** Complete Product with Relations */
export type ProductoCompleto = Producto & {
  categoria: Categoria | null;
  variaciones: Variacion[];
  imagenes: ImagenProducto[];
};
```

---

## Row Level Security (RLS)

**Current State (V1):**
- RLS is **disabled** for public access
- All queries use service role key
- Tables are readable by anonymous users

**Future State (V2):**
```sql
-- Enable RLS on all tables
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_producto ENABLE ROW LEVEL SECURITY;

-- Public read access (only active products)
CREATE POLICY "Public can view active categories"
  ON categorias FOR SELECT
  USING (true);

CREATE POLICY "Public can view active products"
  ON productos FOR SELECT
  USING (activo = true);

CREATE POLICY "Public can view active variations"
  ON variaciones FOR SELECT
  USING (activo = true);

CREATE POLICY "Public can view product images"
  ON imagenes_producto FOR SELECT
  USING (true);

-- Admin write access (authenticated users with admin role)
CREATE POLICY "Admins can manage products"
  ON productos FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

---

## Storage Buckets

**Bucket: `productos`**

Configuration for Supabase Storage (when migrating from public folder):

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true);

-- Allow public read access
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'productos');

-- Allow authenticated uploads (future admin panel)
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'productos'
    AND auth.role() = 'authenticated'
  );
```

**File Structure:**
```
productos/
├── {producto-slug}/
│   ├── principal.jpg
│   ├── imagen-1.jpg
│   ├── imagen-2.jpg
│   └── thumbnails/
│       ├── principal.jpg
│       └── imagen-1.jpg
```

---

## Database Functions

**Future utility functions for admin panel:**

```sql
-- Update product precio_desde based on minimum variation price
CREATE OR REPLACE FUNCTION update_precio_desde()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET precio_desde = (
    SELECT MIN(precio)
    FROM variaciones
    WHERE producto_id = NEW.producto_id
      AND activo = true
  )
  WHERE id = NEW.producto_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update precio_desde
CREATE TRIGGER variaciones_precio_trigger
  AFTER INSERT OR UPDATE OR DELETE ON variaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_precio_desde();

-- Ensure only one principal image per product
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

-- Trigger to ensure single principal image
CREATE TRIGGER imagenes_principal_trigger
  BEFORE INSERT OR UPDATE ON imagenes_producto
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_principal_image();
```

---

## Migration Notes

**From V1 to V2:**

1. **Enable RLS** on all tables
2. **Migrate images** from `/public/images/productos/` to Supabase Storage
3. **Update image URLs** in `imagenes_producto` table
4. **Add triggers** for automatic price updates
5. **Create admin policies** for authenticated users
6. **Add tables** for cart, orders, and user accounts

**Data Integrity Checks:**
```sql
-- Check for products without variations
SELECT p.id, p.nombre
FROM productos p
LEFT JOIN variaciones v ON p.id = v.producto_id AND v.activo = true
WHERE p.activo = true
  AND v.id IS NULL;

-- Check for products without principal image
SELECT p.id, p.nombre
FROM productos p
LEFT JOIN imagenes_producto i ON p.id = i.producto_id AND i.es_principal = true
WHERE p.activo = true
  AND i.id IS NULL;

-- Check for orphaned variations (product inactive but variation active)
SELECT v.id, v.producto_id, p.nombre
FROM variaciones v
JOIN productos p ON v.producto_id = p.id
WHERE v.activo = true
  AND p.activo = false;
```

---

## Performance Considerations

**Indexes:**
- All foreign keys have indexes
- Composite indexes on frequently queried combinations (`categoria_id, activo`)
- Slug columns indexed for fast lookups

**Query Optimization:**
- Use `SELECT *` only when all columns needed
- Fetch relations in a single query (avoid N+1)
- Order nested relations in JavaScript (Supabase limitation)
- Cache product listings with Next.js revalidation

**Monitoring:**
```sql
-- Check for slow queries (enable pg_stat_statements)
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%productos%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Reference Links

- Database Types: `lib/types.ts`
- Query Functions: `lib/supabase/queries.ts`
- Supabase Client: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Business Logic: `.github/reference/business-logic.md`
