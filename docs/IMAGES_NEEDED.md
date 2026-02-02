# Imágenes Requeridas para Home Page

Este documento detalla las imágenes necesarias para que la página de inicio funcione correctamente con el diseño boutique/minimalista implementado.

## Colecciones (6 imágenes - Layout 3-col)

Layout optimizado:

- **Mobile:** 1 columna
- **Tablet:** 2 columnas
- **Desktop:** 3 columnas (2 filas de 3 items)

### 1. Manteles

- **Ruta:** `public/images/colecciones/manteles.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 350KB (optimizado)
- **Descripción:** Imagen vertical de manteles artesanales, preferiblemente con detalle de textura y ambiente de mesa decorada

### 2. Servilletas

- **Ruta:** `public/images/colecciones/servilletas.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 350KB (optimizado)
- **Descripción:** Imagen vertical de servilletas de lino o algodón, mostrando texturas y dobleces

### 3. Caminos de Mesa

- **Ruta:** `public/images/colecciones/caminos.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 350KB (optimizado)
- **Descripción:** Imagen vertical de caminos de mesa decorativos en ambiente real

### 4. Paños de Cocina

- **Ruta:** `public/images/colecciones/panos.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 350KB (optimizado)
- **Descripción:** Imagen vertical de paños absorbentes y resistentes en ambiente de cocina

### 5. Mantas

- **Ruta:** `public/images/colecciones/mantas.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 350KB (optimizado)
- **Descripción:** Imagen vertical de mantas suaves y decorativas, mostrando textura y comodidad

### 6. Tote Bag

- **Ruta:** `public/images/colecciones/tote-bag.jpg`
- **Dimensiones recomendadas:** 800x1200px (2:3 vertical)
- **Formato:** JPG o WebP
- **Peso máximo:** 350KB (optimizado)
- **Descripción:** Imagen vertical de bolsas de tela reutilizables, mostrando detalle y funcionalidad

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

**Redimensionado:**

```bash
# Para todas las imágenes de colecciones (800x1200px - 2:3 vertical)
convert input.jpg -resize 800x1200^ -gravity center -extent 800x1200 output.jpg

# Con Sharp (Node.js)
node -e "
const sharp = require('sharp');
sharp('input.jpg').resize(800, 1200, {fit: 'cover'}).toFile('output.jpg');
"
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

- [ ] Crear directorio `public/images/colecciones/`
- [ ] Agregar imagen `manteles.jpg` (800x1200px)
- [ ] Agregar imagen `servilletas.jpg` (800x1200px)
- [ ] Agregar imagen `caminos.jpg` (800x1200px)
- [ ] Agregar imagen `panos.jpg` (800x1200px)
- [ ] Agregar imagen `mantas.jpg` (800x1200px)
- [ ] Agregar imagen `tote-bag.jpg` (800x1200px)
- [ ] Agregar imagen `linen-texture.jpg` (1920x300px - en `public/images/textures/`)
- [ ] Optimizar todas las imágenes (< 350KB cada una)
- [ ] Actualizar productos destacados en base de datos (`destacado = true`)
- [ ] Verificar que productos tengan imágenes principales (`es_principal = true`)
- [ ] Test visual en dev mode (`npm run dev`)
- [ ] Verificar carga de imágenes en diferentes tamaños de pantalla (mobile, tablet, desktop)

## Migración de Placeholders a Imágenes Reales

Cuando estés listo para reemplazar los placeholders por imágenes reales:

1. **Guarda las imágenes en las rutas especificadas**
2. **NO necesitás modificar ningún componente** - los paths ya están configurados
3. **Recarga la página** - Next.js detectará las nuevas imágenes automáticamente

```bash
# Ejemplo de reemplazo - 6 colecciones
cp ~/Downloads/mis-manteles.jpg public/images/colecciones/manteles.jpg
cp ~/Downloads/mis-servilletas.jpg public/images/colecciones/servilletas.jpg
cp ~/Downloads/mis-caminos.jpg public/images/colecciones/caminos.jpg
cp ~/Downloads/mis-panos.jpg public/images/colecciones/panos.jpg
cp ~/Downloads/mis-mantas.jpg public/images/colecciones/mantas.jpg
cp ~/Downloads/mis-tote.jpg public/images/colecciones/tote-bag.jpg
cp ~/Downloads/textura-lino.jpg public/images/textures/linen-texture.jpg
```

## Soporte

Si necesitás ayuda con las imágenes:

- **Banco de imágenes gratuitas:** Unsplash, Pexels, Pixabay
- **Búsqueda sugerida:** "linen textile", "table linens", "fabric texture", "tablecloth"
- **Licencias:** Verificar que sean libres para uso comercial

---

**Última actualización:** 2026-01-19
