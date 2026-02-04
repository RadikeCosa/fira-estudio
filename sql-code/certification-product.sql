-- Script para insertar producto de certificación de Mercado Pago
-- ID: 1001
-- Producto: Dispositivo de tienda móvil de comercio electrónico
-- Precio: USD 3.99 = ARS 3,999 (aproximadamente, según cotización)

-- Paso 1: Obtener o crear categoría (si no existe)
INSERT INTO categorias (nombre, slug, descripcion, orden)
VALUES (
  'Certificación',
  'certificacion',
  'Productos para pruebas de certificación de pasarelas de pago',
  999
)
ON CONFLICT (slug) DO NOTHING;

-- Paso 2: Insertar producto de certificación
INSERT INTO productos (nombre, slug, descripcion, categoria_id, precio_desde, destacado, activo, tiempo_fabricacion)
VALUES (
  'Dispositivo de tienda móvil de comercio electrónico',
  'dispositivo-tienda-movil-ecommerce',
  'Dispositivo de tienda móvil de comercio electrónico para testing de pagos con Mercado Pago',
  (SELECT id FROM categorias WHERE slug = 'certificacion'),
  3999.00,
  false,
  true,
  '1-2 días hábiles'
);

-- Paso 3: Insertar variación (1001-STD)
INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, sku, activo)
VALUES (
  (SELECT id FROM productos WHERE slug = 'dispositivo-tienda-movil-ecommerce'),
  'Estándar',
  'Negro',
  3999.00,
  100,
  '1001-STD',
  true
);

-- Paso 4: Insertar imagen principal
INSERT INTO imagenes_producto (producto_id, url, alt_text, orden, es_principal)
VALUES (
  (SELECT id FROM productos WHERE slug = 'dispositivo-tienda-movil-ecommerce'),
  'products/dispositivo-tienda-movil/principal.jpg',
  'Dispositivo de tienda móvil de comercio electrónico',
  0,
  true
);

-- Verificación: mostrar producto creado
SELECT 
  p.id,
  p.nombre,
  p.slug,
  p.descripcion,
  p.precio_desde,
  v.sku,
  v.tamanio,
  v.color,
  v.precio,
  v.stock
FROM productos p
LEFT JOIN variaciones v ON p.id = v.producto_id
WHERE p.slug = 'dispositivo-tienda-movil-ecommerce';
