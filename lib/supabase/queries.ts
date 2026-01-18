/**
 * Queries reutilizables para Supabase
 * Uso en Server Components: await getCategorias()
 */

import { createClient } from "@/lib/supabase/server";
import type { Categoria, ProductoCompleto } from "@/lib/types";
import type { PaginatedResult } from "@/lib/types/pagination";
import { ProductoRepository } from "@/lib/repositories/producto.repository";
import { createCachedQuery, CACHE_CONFIG } from "@/lib/cache";

interface GetProductosParams {
  categoriaSlug?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Obtiene todas las categorías ordenadas (sin cache)
 * Usar para admin o cuando se necesita data fresca
 * @returns Lista de categorías ordenadas por campo 'orden'
 */
async function getCategoriasInternal(): Promise<Categoria[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

/**
 * Obtiene todas las categorías ordenadas (con cache)
 * @returns Lista de categorías ordenadas por campo 'orden'
 */
export const getCategorias = createCachedQuery<[], Categoria[]>(
  getCategoriasInternal,
  CACHE_CONFIG.categorias,
);

/**
 * Obtiene categorías sin cache (para admin)
 * @returns Lista de categorías ordenadas por campo 'orden'
 */
export const getCategoriasFresh = getCategoriasInternal;

/**
 * Obtiene productos activos con sus relaciones (implementación interna sin cache)
 * @param categoriaSlug - Filtrar por slug de categoría (opcional)
 * @returns Lista de productos completos (destacados primero, luego por nombre)
 */
async function getProductosInternal(
  params?: GetProductosParams,
): Promise<PaginatedResult<ProductoCompleto>> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.max(1, params?.pageSize ?? 12);
  const categoriaSlug = params?.categoriaSlug;

  const productoRepository = new ProductoRepository();

  // Query base con relaciones
  const start = (page - 1) * pageSize;

  const { items, total } = await productoRepository.findAllCached({
    categoria: categoriaSlug,
    limit: pageSize,
    offset: start,
  });

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Obtiene productos activos con sus relaciones (con cache)
 * @param categoriaSlug - Filtrar por slug de categoría (opcional)
 * @returns Lista de productos completos (destacados primero, luego por nombre)
 */
export const getProductos = createCachedQuery<
  [GetProductosParams?],
  PaginatedResult<ProductoCompleto>
>(getProductosInternal, CACHE_CONFIG.productos);

/**
 * Obtiene productos sin cache (para admin)
 * @param categoriaSlug - Filtrar por slug de categoría (opcional)
 * @returns Lista de productos completos (destacados primero, luego por nombre)
 */
export const getProductosFresh = getProductosInternal;

/**
 * Obtiene un producto por su slug (implementación interna sin cache)
 * @param slug - Slug único del producto
 * @returns Producto completo o null si no existe/inactivo
 */
async function getProductoBySlugInternal(
  slug: string,
): Promise<ProductoCompleto | null> {
  const productoRepository = new ProductoRepository();
  return productoRepository.findBySlugCached(slug);
}

/**
 * Obtiene un producto por su slug (con cache)
 * @param slug - Slug único del producto
 * @returns Producto completo o null si no existe/inactivo
 */
export const getProductoBySlug = createCachedQuery<
  [string],
  ProductoCompleto | null
>(getProductoBySlugInternal, CACHE_CONFIG.producto_detail);

/**
 * Obtiene un producto por su slug sin cache (para admin)
 * @param slug - Slug único del producto
 * @returns Producto completo o null si no existe/inactivo
 */
export async function getProductoBySlugFresh(
  slug: string,
): Promise<ProductoCompleto | null> {
  const productoRepository = new ProductoRepository();
  return productoRepository.findBySlug(slug);
}

/**
 * Obtiene productos relacionados de la misma categoría
 * @param productoId - ID del producto actual (para excluir)
 * @param categoriaId - ID de la categoría
 * @param limite - Número de productos a retornar (default: 4)
 * @returns Lista de productos relacionados activos
 */
export async function getProductosRelacionados(
  productoId: string,
  categoriaId: string,
  limite: number = 4,
): Promise<ProductoCompleto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categoria:categorias(*),
      variaciones(*),
      imagenes:imagenes_producto(*)
    `,
    )
    .eq("categoria_id", categoriaId)
    .eq("activo", true)
    .neq("id", productoId)
    .limit(limite);

  if (error) throw error;

  return (data as ProductoCompleto[]) ?? [];
}
