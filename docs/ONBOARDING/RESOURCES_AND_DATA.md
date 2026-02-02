# Resources & Data - Onboarding Guide

**Última actualización:** 29 de enero de 2026  
**Proyecto:** Challaco - Textile E-commerce  
**Database:** Supabase (PostgreSQL)

---

## Índice

1. [Estructura de Recursos](#estructura-de-recursos)
2. [Images Directory](#images-directory)
3. [SQL Code & Database](#sql-code--database)
4. [Data Management](#data-management)
5. [Environment Setup](#environment-setup)

---

## Estructura de Recursos

```
proyecto/
├── public/
│   └── images/                 # Imágenes públicas (assets estáticos)
│       ├── placeholder.jpg     # Imagen fallback
│       ├── hero/               # Imágenes hero section
│       └── collections/        # Imágenes de colecciones
│
├── sql-code/                   # SQL scripts para DB setup
│   ├── main.sql                # Schema principal
│   ├── init-real-data.sql      # Datos reales de producción
│   ├── mock-data.sql           # Datos de prueba
│   ├── add-data.sql            # Scripts para agregar datos
│   ├── product-list.sql        # Lista de productos específicos
│   └── data.csv                # Datos en formato CSV
│
└── .env.local                  # Environment variables (Git-ignored)
```

---

## Images Directory

### public/images/

```
public/images/
├── placeholder.jpg             # 800x800px default fallback
├── favicon.ico                 # 32x32px site icon
│
├── hero/
│   ├── desktop.jpg             # 1920x1080px hero desktop
│   ├── tablet.jpg              # 1024x768px hero tablet
│   └── mobile.jpg              # 375x667px hero mobile
│
├── collections/
│   ├── manteles.jpg            # Collection banner
│   ├── caminos-de-mesa.jpg
│   ├── cortinas.jpg
│   └── otros.jpg
│
└── texture/
    └── divider.jpg             # Texture divider image
```

### Ubicación de Imágenes en Supabase

**Storage Bucket:** `productos` (CORS enabled)

```
Supabase Storage: https://{PROJECT}.supabase.co/storage/v1/object/public/productos/

Estructura:
{bucket}/
├── {producto-id}/
│   ├── principal.jpg           # Imagen principal
│   ├── image-1.jpg             # Galería 1
│   ├── image-2.jpg             # Galería 2
│   └── image-3.jpg             # Galería 3
│
├── categories/
│   ├── manteles/
│   ├── caminos-de-mesa/
│   └── cortinas/
│
└── collections/
    └── featured/
```

### Image Optimization

#### Next.js Image Component

```typescript
import Image from "next/image";

<Image
  src={imagenUrl}                    // URL from Supabase or public/
  alt={imageAlt}                     // Descriptive alt text
  fill                               // Fill container
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"                     // Lazy load
  className="object-cover"
  priority={isHero}                  // True solo para hero
/>
```

#### Formatos Soportados

- **JPEG** - Fotografías, galería
- **PNG** - Transparencia, logos
- **WebP** - Comprimido (Next.js auto-conversion)

#### Dimensiones Recomendadas

```
Thumbnail/Card:     400x400px   (~50KB JPEG)
Product Gallery:    800x800px   (~150KB JPEG)
Hero Section:       1920x1080px (~300KB JPEG)
Collection Banner:  600x400px   (~100KB JPEG)

Total Budget: ~50MB storage (Supabase free tier)
```

### Image Utilities

**Archivo:** `lib/utils/image.ts`

```typescript
// Resolución de URL
export function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "/images/placeholder.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;

  // Construir URL de Supabase
  return `${SUPABASE_URL}/storage/v1/object/public/productos/${imagePath}`;
}

// Alt text
export function getProductImageAlt(
  productName: string,
  customAlt?: string,
): string {
  return customAlt || `Imagen de ${productName}`;
}

// Extraer imagen principal
export function getPrincipalImage(imagenes: Imagen[]) {
  return imagenes.find((img) => img.es_principal) || imagenes[0];
}
```

---

## SQL Code & Database

### Database Schema

**Proyecto Supabase:** challaco-prod (PostgreSQL 15)

#### Tabla: productos

```sql
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id),
  precio_desde INTEGER,
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  tiempo_fabricacion VARCHAR(100),
  material VARCHAR(255),
  cuidados TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
```

#### Tabla: variaciones

```sql
CREATE TABLE variaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tamanio VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  precio INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_variaciones_producto ON variaciones(producto_id);
CREATE INDEX idx_variaciones_sku ON variaciones(sku);
CREATE UNIQUE INDEX idx_variaciones_unique ON variaciones(producto_id, tamanio, color);
```

#### Tabla: imagenes_producto

```sql
CREATE TABLE imagenes_producto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  es_principal BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_imagenes_producto ON imagenes_producto(producto_id);
```

#### Tabla: categorias

```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(500),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_categorias_slug ON categorias(slug);
```

#### Tabla: consultas (Contact Form Submissions)

```sql
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  mensaje TEXT NOT NULL,
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT now(),
  estado VARCHAR(50) DEFAULT 'nueva'  -- nueva, leida, respondida
);

-- Índices
CREATE INDEX idx_consultas_email ON consultas(email);
CREATE INDEX idx_consultas_created ON consultas(created_at);
```

### SQL Scripts

#### main.sql

**Propósito:** Schema completo + tablas vacías

```bash
# Ejecutar en Supabase SQL Editor
psql -f sql-code/main.sql
```

**Contenido:**

- CREATE TABLE statements
- Índices
- Row Level Security (RLS) policies

#### init-real-data.sql

**Propósito:** Cargar datos de producción reales

```bash
# Ejecutar en Supabase SQL Editor
psql -f sql-code/init-real-data.sql
```

**Incluye:**

- ~20 productos reales con variaciones
- 5 categorías
- Imágenes principales

#### mock-data.sql

**Propósito:** Datos de prueba para desarrollo local

```bash
# Ejecutar en dev environment
psql -f sql-code/mock-data.sql
```

**Incluye:**

- 5 productos simples
- 2-3 variaciones cada uno
- Imágenes placeholder

#### add-data.sql

**Propósito:** Scripts reutilizables para agregar datos

```sql
-- Agregar un producto
INSERT INTO productos (nombre, slug, descripcion, categoria_id, precio_desde, activo)
VALUES ('Nuevo Mantel', 'nuevo-mantel', 'Descripción...', '...', 15000, true);

-- Agregar variación
INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, activo)
VALUES ('...', '150x200cm', 'Rojo', 15000, 5, true);
```

#### data.csv

**Propósito:** Importar datos desde CSV

```csv
nombre,slug,descripcion,categoria_id,precio_desde,destacado,activo
Mantel Floral,mantel-floral,Mantel artesanal floral,cat-1,15000,true,true
Camino de Mesa,camino-de-mesa,Camino elegante,cat-2,8500,false,true
```

---

## Data Management

### Supabase Client Setup

**Archivo:** `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

### Data Queries

**Archivo:** `lib/supabase/queries.ts`

```typescript
// Obtener todos los productos
export async function getProductos(filters?: {
  categoriaSlug?: string;
  page?: number;
  pageSize?: number;
}) {
  let query = supabase
    .from("productos")
    .select("*, variaciones(*), imagenes_producto(*)", { count: "exact" })
    .eq("activo", true);

  if (filters?.categoriaSlug) {
    query = query.eq("categorias.slug", filters.categoriaSlug);
  }

  const { data, count } = await query;

  return {
    productos: data,
    totalPages: Math.ceil((count || 0) / (filters?.pageSize || 12)),
  };
}

// Obtener producto por slug
export async function getProductoBySlug(slug: string) {
  const { data } = await supabase
    .from("productos")
    .select("*, variaciones(*), imagenes_producto(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  return data;
}

// Obtener categorías
export async function getCategorias() {
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .eq("activo", true)
    .order("orden");

  return data || [];
}

// Insertar consulta (Contact Form)
export async function insertConsulta(consulta: ConsultaInsert) {
  const { error } = await supabase.from("consultas").insert([consulta]);

  if (error) throw error;
}
```

### Caché & Revalidation

```typescript
// ISR: Revalidate cada hora
export const revalidate = 3600;

// On-demand revalidation
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateProductoAdmin(productoId: string) {
  // ... actualizar producto

  // Revalidar página del producto
  revalidatePath(`/productos/${slug}`, "page");

  // Revalidar listado
  revalidatePath("/productos", "page");
}
```

---

## Environment Setup

### Environment Variables

**Archivo:** `.env.local` (Git-ignored)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Analytics (opcional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# WhatsApp (opcional)
NEXT_PUBLIC_WHATSAPP_NUMBER=+5491123456789

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000      # 5 minutos
RATE_LIMIT_MAX_REQUESTS=3
```

### Development Setup

#### 1. Crear Proyecto Supabase

```bash
# En supabase.com
1. Click "New Project"
2. Seleccionar región (us-east-1 recomendado)
3. Copiar URL y ANON_KEY
```

#### 2. Ejecutar Schema

```bash
# En Supabase SQL Editor
1. Abrir SQL Editor
2. Copiar contenido de sql-code/main.sql
3. Ejecutar
4. Ejecutar sql-code/mock-data.sql para datos de prueba
```

#### 3. Configurar Environment

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY

# Guardar bien, no commitear
```

#### 4. Verificar Conexión

```bash
npm run dev

# Visitar: http://localhost:3000/productos
# Debería mostrar productos de la BD
```

### Production Setup

#### Supabase Production Database

```
Proyecto: challaco-prod
Region: us-east-1
Backup: Daily (7 days retention)
```

#### Connection String

```
Formato: postgresql://user:password@db.supabase.co:5432/postgres
Uso: En migraciones, scripts de admin
```

#### Backups

```bash
# Supabase hace backups automáticos
# Acceder desde: Project Settings > Backups

# O hacer backup manual
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql
```

---

## Data Operations

### Agregar Nuevo Producto

**Via SQL:**

```sql
INSERT INTO productos (nombre, slug, descripcion, categoria_id, precio_desde, activo)
VALUES ('Nuevo', 'nuevo', 'Desc', 'cat-id', 15000, true);
```

**Via Admin UI (Futuro):**

```
1. Login en admin panel
2. Click "Nuevo Producto"
3. Llenar formulario
4. Click "Guardar"
5. Auto-revalidate ISR
```

### Editar Variación

```typescript
// API endpoint (futuro)
export async function updateVariacion(
  variaciónId: string,
  updates: Partial<Variacion>,
) {
  const { error } = await supabase
    .from("variaciones")
    .update(updates)
    .eq("id", variaciónId);

  if (error) throw error;

  // Revalidate product page
  revalidatePath("/productos/[slug]", "page");
}
```

### Exportar Datos

```bash
# Exportar a CSV
psql -h db.supabase.co -U postgres -d postgres -c \
  "SELECT * FROM productos" > productos.csv

# Importar desde CSV
psql -h db.supabase.co -U postgres -d postgres -c \
  "COPY productos FROM STDIN WITH (FORMAT csv)" < productos.csv
```

---

## Seguridad

### Row Level Security (RLS)

```sql
-- Productos (todos pueden leer, solo autenticados pueden escribir)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos readable by all" ON productos
  FOR SELECT
  USING (activo = true);

CREATE POLICY "Productos writable by authenticated" ON productos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Consultas (todos pueden insertar, solo owner puede leer)
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultas insertable by all" ON consultas
  FOR INSERT
  WITH CHECK (true);
```

### Storage Security

```
- Bucket: productos (public read, private write)
- Permiso: Cualquiera puede leer
- Permiso: Solo admin puede escribir
```

### API Security

```typescript
// Rate limiting en API
export async function POST(request: Request) {
  const ip = request.ip || request.headers.get("x-forwarded-for");

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return new Response("Too many requests", { status: 429 });
  }

  // ... procesar request
}
```

---

## Monitoring

### Database Health

```sql
-- Ver conexiones activas
SELECT count(*) FROM pg_stat_activity;

-- Ver queries lentas
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Ver tamaño de tablas
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Storage Usage

```
Supabase Dashboard > Storage
- Ver uso total
- Ver por bucket
- Descargar reportes
```

---

## Recursos Adicionales

### Documentos Relacionados

- [Pages & Routes](./PAGES_AND_ROUTES.md) - Data fetching en páginas
- [Configuration & Standards](./CONFIGURATION.md) - Environment setup

### Links Útiles

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### CLI Tools

```bash
# Supabase CLI
npm install -g supabase

# Listar bases de datos
supabase db list

# Ver estado
supabase status
```

---

**Última actualización:** 29 de enero de 2026  
**Mantenido por:** Equipo de desarrollo Challaco
