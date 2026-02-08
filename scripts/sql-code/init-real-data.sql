-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categorías
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  imagen TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  precio_desde DECIMAL(10,2),
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  tiempo_fabricacion VARCHAR(100) DEFAULT '3-5 días hábiles',
  material TEXT,
  cuidados TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variaciones (tamaño/color)
CREATE TABLE variaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  tamanio VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Imágenes
CREATE TABLE imagenes_producto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(200),
  orden INT DEFAULT 0,
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultas
CREATE TABLE consultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  variacion_id UUID REFERENCES variaciones(id) ON DELETE SET NULL,
  mensaje TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'nueva',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo) WHERE activo = true;
CREATE INDEX idx_variaciones_producto ON variaciones(producto_id);
CREATE INDEX idx_imagenes_producto ON imagenes_producto(producto_id);

-- RLS (Row Level Security)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura
CREATE POLICY "Public read categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Public read productos" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "Public read variaciones" ON variaciones FOR SELECT USING (activo = true);
CREATE POLICY "Public read imagenes" ON imagenes_producto FOR SELECT USING (true);
CREATE POLICY "Public insert consultas" ON consultas FOR INSERT WITH CHECK (true);

-- Datos reales de categorías
INSERT INTO categorias (nombre, slug, descripcion, orden, imagen, featured) VALUES
  ('Manteles', 'manteles', 'Manteles para todo tipo de ocasiones', 1, '/images/productos/manteles/mantel-beige.jpg', true),
  ('Servilletas', 'servilletas', 'Servilletas de tela de alta calidad', 2, '/images/productos/servilletas/servilleta-azul.jpg', false),
  ('Caminos de Mesa', 'caminos-de-mesa', 'Caminos decorativos para tu mesa', 3, '/images/productos/caminos/camino-blanco.jpg', false),
  ('Paños de Cocina', 'panos-de-cocina', 'Paños absorbentes y resistentes', 4, '/images/productos/panos/pano-cocina.jpg', false),
  ('Mantas', 'mantas', 'Mantas suaves y decorativas', 5, '/images/productos/mantas/manta-gris.jpg', false),
  ('Tote Bag', 'tote-bag', 'Bolsas de tela reutilizables', 6, '/images/productos/tote-bag/tote-bag.jpg', false);

-- Aquí puedes agregar los INSERT de productos, variaciones e imágenes reales siguiendo el mismo formato.
