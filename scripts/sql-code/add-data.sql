-- Asigna la categoría correcta a cada producto
WITH m(slug_prod, slug_cat) AS (
  VALUES
    ('mantel-floral-elegante',   'manteles'),
    ('mantel-liso-minimalista',  'manteles'),
    ('servilletas-lino-natural', 'servilletas'),
    ('camino-mesa-rustico',      'caminos-de-mesa')
)
UPDATE productos p
SET categoria_id = c.id
FROM m
JOIN categorias c ON c.slug = m.slug_cat
WHERE p.slug = m.slug_prod;