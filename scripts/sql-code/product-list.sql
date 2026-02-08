-- Ver productos con sus imágenes
SELECT 
  p.nombre,
  p.slug,
  c.nombre as categoria,
  p.precio_desde,
  i.url as imagen,
  i.es_principal,
  i.orden,
  p.destacado,
  p.activo
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN imagenes_producto i ON i.producto_id = p.id
ORDER BY p.created_at DESC, i.orden;

-- O si prefieres ver solo la imagen principal de cada producto:
SELECT 
  p.nombre,
  p.slug,
  c.nombre as categoria,
  p.precio_desde,
  i.url as imagen_principal,
  p.destacado,
  p.activo,
  COUNT(v.id) as total_variaciones
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN imagenes_producto i ON i.producto_id = p.id AND i.es_principal = true
LEFT JOIN variaciones v ON v.producto_id = p.id
GROUP BY p.id, p.nombre, p.slug, c.nombre, p.precio_desde, i.url, p.destacado, p.activo
ORDER BY p.created_at DESC;