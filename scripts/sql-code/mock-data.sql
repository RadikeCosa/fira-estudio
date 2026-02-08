-- Script para cargar productos de prueba
-- Ejecutar todo de una vez

-- Producto 1: Mantel Floral Elegante
DO $$
DECLARE
  producto_id UUID;
  cat_id UUID;
BEGIN
  -- Obtener ID de categoría Manteles
  SELECT id INTO cat_id FROM categorias WHERE slug = 'manteles';
  
  -- Insertar producto
  INSERT INTO productos (
    nombre, 
    slug, 
    descripcion, 
    categoria_id, 
    precio_desde, 
    destacado, 
    activo, 
    material, 
    tiempo_fabricacion,
    cuidados
  ) VALUES (
    'Mantel Floral Elegante',
    'mantel-floral-elegante',
    'Hermoso mantel con diseño floral, perfecto para ocasiones especiales. Fabricado en tela de alta calidad con acabados impecables. Ideal para mesas de 6 a 8 personas.',
    cat_id,
    5500,
    true,  -- Destacado
    true,
    'Algodón 100%',
    '3-5 días hábiles',
    'Lavar a máquina en agua fría. No usar blanqueador. Planchar a temperatura media.'
  ) RETURNING id INTO producto_id;

  -- Variaciones del producto
  INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, sku, activo) VALUES
    (producto_id, '140x220cm', 'Blanco', 5500, 5, 'MAN-FLO-140-BLA', true),
    (producto_id, '140x220cm', 'Azul', 5500, 3, 'MAN-FLO-140-AZU', true),
    (producto_id, '160x240cm', 'Blanco', 6800, 2, 'MAN-FLO-160-BLA', true),
    (producto_id, '160x240cm', 'Azul', 6800, 1, 'MAN-FLO-160-AZU', true);

  -- Imágenes del producto
  INSERT INTO imagenes_producto (producto_id, url, alt_text, orden, es_principal) VALUES
    (producto_id, '/images/productos/manteles/mantel-beige.jpg', 'Mantel floral elegante', 0, true);
END $$;

-- Producto 2: Mantel Liso Minimalista
DO $$
DECLARE
  producto_id UUID;
  cat_id UUID;
BEGIN
  SELECT id INTO cat_id FROM categorias WHERE slug = 'manteles';
  
  INSERT INTO productos (
    nombre, 
    slug, 
    descripcion, 
    categoria_id, 
    precio_desde, 
    destacado, 
    activo, 
    material,
    tiempo_fabricacion
  ) VALUES (
    'Mantel Liso Minimalista',
    'mantel-liso-minimalista',
    'Mantel de diseño minimalista en colores neutros. Perfecto para el uso diario o eventos formales. Su simplicidad lo hace versátil y atemporal.',
    cat_id,
    4200,
    false,
    true,
    'Lino y algodón',
    '3-5 días hábiles'
  ) RETURNING id INTO producto_id;

  INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, sku, activo) VALUES
    (producto_id, '140x220cm', 'Beige', 4200, 8, 'MAN-LIS-140-BEI', true),
    (producto_id, '140x220cm', 'Gris', 4200, 6, 'MAN-LIS-140-GRI', true);

  INSERT INTO imagenes_producto (producto_id, url, alt_text, orden, es_principal) VALUES
    (producto_id, '/images/placeholders/placeholder-image.jpeg', 'Mantel liso minimalista', 0, true);
END $$;

-- Producto 3: Servilletas de Lino Natural
DO $$
DECLARE
  producto_id UUID;
  cat_id UUID;
BEGIN
  SELECT id INTO cat_id FROM categorias WHERE slug = 'servilletas';
  
  INSERT INTO productos (
    nombre, 
    slug, 
    descripcion, 
    categoria_id, 
    precio_desde, 
    destacado, 
    activo, 
    material,
    tiempo_fabricacion
  ) VALUES (
    'Servilletas de Lino Natural',
    'servilletas-lino-natural',
    'Set de 4 servilletas de lino 100% natural. Suaves, absorbentes y duraderas. Perfectas para una mesa elegante y sostenible.',
    cat_id,
    2800,
    true,  -- Destacado
    true,
    'Lino 100%',
    '2-4 días hábiles'
  ) RETURNING id INTO producto_id;

  INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, sku, activo) VALUES
    (producto_id, '45x45cm', 'Natural', 2800, 15, 'SER-LIN-45-NAT', true),
    (producto_id, '45x45cm', 'Blanco', 2800, 12, 'SER-LIN-45-BLA', true);

  INSERT INTO imagenes_producto (producto_id, url, alt_text, orden, es_principal) VALUES
    (producto_id, '/images/productos/servilletas/servilleta-azul.jpg', 'Servilletas de lino natural', 0, true);
END $$;

-- Producto 4: Camino de Mesa Rústico
DO $$
DECLARE
  producto_id UUID;
  cat_id UUID;
BEGIN
  SELECT id INTO cat_id FROM categorias WHERE slug = 'caminos-de-mesa';
  
  INSERT INTO productos (
    nombre, 
    slug, 
    descripcion, 
    categoria_id, 
    precio_desde, 
    destacado, 
    activo, 
    material,
    tiempo_fabricacion
  ) VALUES (
    'Camino de Mesa Rústico',
    'camino-mesa-rustico',
    'Camino de mesa con estilo rústico, ideal para decorar tu comedor con elegancia natural. Su textura y color aportan calidez a cualquier ambiente.',
    cat_id,
    3200,
    false,
    true,
    'Lino',
    '3-5 días hábiles'
  ) RETURNING id INTO producto_id;

  INSERT INTO variaciones (producto_id, tamanio, color, precio, stock, sku, activo) VALUES
    (producto_id, '40x150cm', 'Natural', 3200, 8, 'CAM-RUS-40-NAT', true),
    (producto_id, '40x180cm', 'Natural', 3800, 4, 'CAM-RUS-45-NAT', true);

  INSERT INTO imagenes_producto (producto_id, url, alt_text, orden, es_principal) VALUES
    (producto_id, '/images/productos/caminos/camino-blanco (1).jpg', 'Camino de mesa rústico natural', 0, true);
END $$;