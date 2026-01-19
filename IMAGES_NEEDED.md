# Imágenes Requeridas para Home Page

Este documento detalla las imágenes necesarias para que la página de inicio funcione correctamente con el diseño boutique/minimalista implementado.

## Colecciones (3 imágenes)

### 1. Manteles
- **Ruta:** `public/images/colecciones/manteles.jpg`
- **Dimensiones recomendadas:** 1920x820px (21:9 panorámico)
- **Formato:** JPG o WebP
- **Peso máximo:** 500KB (optimizado)
- **Descripción:** Imagen panorámica de manteles artesanales, preferiblemente con detalle de textura y ambiente de mesa decorada
- **Nota:** Esta imagen se mostrará en formato wide (full-width) en la grilla de colecciones

### 2. Servilletas
- **Ruta:** `public/images/colecciones/servilletas.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 400KB (optimizado)
- **Descripción:** Imagen vertical de servilletas de lino o algodón, mostrando texturas y dobleces

### 3. Caminos de Mesa
- **Ruta:** `public/images/colecciones/caminos.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 400KB (optimizado)
- **Descripción:** Imagen vertical de caminos de mesa decorativos en ambiente real

## Texturas (1 imagen)

### Textura de Lino
- **Ruta:** `public/images/textures/linen-texture.jpg`
- **Dimensiones recomendadas:** 1920x300px (panorámica)
- **Formato:** JPG o WebP
- **Peso máximo:** 300KB (optimizado)
- **Descripción:** Close-up macro de textura de lino natural, enfocando en el tejido y fibras
- **Nota:** Se aplicará filtro `grayscale` y `opacity-30` automáticamente por CSS
- **Consejo:** Buscar imágenes con buen contraste y detalle de textura, ya que el filtro las suavizará

## Productos Destacados

Las imágenes de productos destacados **se cargan automáticamente desde la base de datos** (tabla `imagenes_producto`).

### Requisitos en Base de Datos

Para que la sección de productos destacados funcione correctamente:

1. **Marca productos como destacados:**
```sql
UPDATE productos 
SET destacado = true 
WHERE slug IN ('mantel-floral', 'servilletas-lino', 'camino-mesa-rustico', 'mantel-beige');
```

2. **Asegura que cada producto tenga al menos una imagen:**
   - Cada producto debe tener registros en la tabla `imagenes_producto`
   - Al menos una imagen por producto debe tener `es_principal = true`
   - Las rutas de imágenes deben ser válidas y los archivos deben existir en `public/images/productos/`

3. **Verifica que las imágenes existan:**
```bash
ls -la public/images/productos/manteles/
ls -la public/images/productos/servilletas/
ls -la public/images/productos/caminos/
```

## Placeholders Temporales

Si **no tenés las imágenes ahora**, podés usar servicios de placeholder temporales:

### Opción 1: Unsplash (recomendado - imágenes reales)
```typescript
// En components/home/CollectionsGrid.tsx (temporal)
const COLLECTIONS = [
  {
    name: "Manteles",
    slug: "manteles",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&h=820&fit=crop", // Linen tablecloth
    // ...
  },
  // ...
];
```

**URLs de ejemplo:**
- Manteles: `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&h=820&fit=crop`
- Servilletas: `https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&h=1200&fit=crop`
- Caminos: `https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=1200&fit=crop`
- Textura: `https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?w=1920&h=300&fit=crop`

### Opción 2: Placehold.co (placeholders con texto)
```typescript
const COLLECTIONS = [
  {
    name: "Manteles",
    slug: "manteles",
    image: "https://placehold.co/1920x820/A45C40/FFFFFF?text=Manteles",
    // ...
  },
];
```

### Opción 3: Usar imágenes existentes del proyecto
Si ya tenés imágenes de productos, podés reutilizarlas temporalmente:

```typescript
const COLLECTIONS = [
  {
    name: "Manteles",
    slug: "manteles",
    image: "/images/productos/manteles/mantel-beige.jpg", // Reutilizar imagen existente
    // ...
  },
];
```

## Optimización de Imágenes

### Herramientas Recomendadas

**Compresión:**
- [TinyPNG](https://tinypng.com/) - Compresión con pérdida mínima
- [Squoosh](https://squoosh.app/) - Control fino de compresión

**Redimensionado:**
```bash
# Con ImageMagick
convert input.jpg -resize 1920x820^ -gravity center -extent 1920x820 output.jpg

# Con Sharp (Node.js)
npm install sharp
node -e "require('sharp')('input.jpg').resize(1920, 820, {fit: 'cover'}).toFile('output.jpg')"
```

**Conversión a WebP:**
```bash
# Con cwebp
cwebp -q 85 input.jpg -o output.webp

# Con Sharp
node -e "require('sharp')('input.jpg').webp({quality: 85}).toFile('output.webp')"
```

### Next.js Image Optimization

Next.js optimiza automáticamente las imágenes cuando usás el componente `<Image>`:
- Genera múltiples tamaños (responsive)
- Lazy loading automático
- Formato moderno (WebP/AVIF) si el browser lo soporta
- No necesitás pre-optimizar manualmente si usás `<Image>`

## Checklist de Implementación

- [ ] Crear directorios `public/images/colecciones/` y `public/images/textures/`
- [ ] Agregar imagen `manteles.jpg` (1920x820px)
- [ ] Agregar imagen `servilletas.jpg` (800x1200px)
- [ ] Agregar imagen `caminos.jpg` (800x1200px)
- [ ] Agregar imagen `linen-texture.jpg` (1920x300px)
- [ ] Optimizar todas las imágenes (< 500KB cada una)
- [ ] Actualizar productos destacados en base de datos (`destacado = true`)
- [ ] Verificar que productos tengan imágenes principales (`es_principal = true`)
- [ ] Test visual en dev mode (`npm run dev`)
- [ ] Verificar carga de imágenes en diferentes tamaños de pantalla

## Migración de Placeholders a Imágenes Reales

Cuando estés listo para reemplazar los placeholders por imágenes reales:

1. **Guarda las imágenes en las rutas especificadas**
2. **NO necesitás modificar ningún componente** - los paths ya están configurados
3. **Recarga la página** - Next.js detectará las nuevas imágenes automáticamente

```bash
# Ejemplo de reemplazo
cp ~/Downloads/mis-manteles.jpg public/images/colecciones/manteles.jpg
cp ~/Downloads/mis-servilletas.jpg public/images/colecciones/servilletas.jpg
cp ~/Downloads/mis-caminos.jpg public/images/colecciones/caminos.jpg
cp ~/Downloads/textura-lino.jpg public/images/textures/linen-texture.jpg
```

## Soporte

Si necesitás ayuda con las imágenes:
- **Banco de imágenes gratuitas:** Unsplash, Pexels, Pixabay
- **Búsqueda sugerida:** "linen textile", "table linens", "fabric texture", "tablecloth"
- **Licencias:** Verificar que sean libres para uso comercial

---

**Última actualización:** 2026-01-19
