/**
 * Tipos TypeScript para la tienda de textiles
 * Mapean las tablas de Supabase (PostgreSQL)
 */

/** Categoría de productos (manteles, servilletas, caminos de mesa) */
export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  orden: number;
  imagen?: string | null;
  featured?: boolean | null;
}

/** Producto base del catálogo */
export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoria_id: string | null;
  /** Precio mínimo para mostrar "desde $X" */
  precio_desde: number | null;
  destacado: boolean;
  activo: boolean;
  tiempo_fabricacion: string;
  material: string | null;
  cuidados: string | null;
  created_at: string;
}

/** Variación de producto (tamaño, color, precio específico) */
export interface Variacion {
  id: string;
  producto_id: string;
  tamanio: string;
  color: string;
  precio: number;
  stock: number;
  sku: string | null;
  activo: boolean;
  producto?: Producto & { imagenes?: ImagenProducto[] }; // opcional, para populación
}

/** Imagen asociada a un producto */
export interface ImagenProducto {
  id: string;
  producto_id: string;
  url: string;
  alt_text: string | null;
  orden: number;
  es_principal: boolean;
}

/** Producto con todas sus relaciones cargadas */
export type ProductoCompleto = Producto & {
  categoria: Categoria | null;
  variaciones: Variacion[];
  imagenes: ImagenProducto[];
};
