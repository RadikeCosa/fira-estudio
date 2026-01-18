/**
 * Queries reutilizables para Supabase
 * Uso en Server Components: await getCategorias()
 */

import { createClient } from "@/lib/supabase/server";
import type { Categoria, ProductoCompleto } from "@/lib/types";
import type { PaginatedResult } from "@/lib/types/pagination";
import { ProductoRepository } from "@/lib/repositories/producto.repository";
import { createCachedQuery, CACHE_CONFIG } from "@/lib/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

interface GetProductosParams {
  categoriaSlug?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Obtiene todas las categorías ordenadas (implementación interna)
 * Usar para admin o cuando se necesita data fresca
 * @param supabase - Supabase client instance
 * @returns Lista de categorías ordenadas por campo 'orden'
 */
async function getCategoriasInternal(
  supabase: SupabaseClient,
): Promise<Categoria[]> {
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
export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();

  const cachedFn = createCachedQuery<[SupabaseClient], Categoria[]>(
    getCategoriasInternal,
    CACHE_CONFIG.categorias,
  );

  return cachedFn(supabase);
}

/**
 * Obtiene categorías sin cache (para admin)
 * @returns Lista de categorías ordenadas por campo 'orden'
 */
export async function getCategoriasFresh(): Promise<Categoria[]> {
  const supabase = await createClient();
  return getCategoriasInternal(supabase);
}

/**
 * Obtiene productos activos con sus relaciones (implementación interna)
 * @param supabase - Supabase client instance
 * @param params - Optional parameters for filtering and pagination
 * @returns Lista de productos completos (destacados primero, luego por nombre)
 */
async function getProductosInternal(
  supabase: SupabaseClient,
  params?: GetProductosParams,
): Promise<PaginatedResult<ProductoCompleto>> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.max(1, params?.pageSize ?? 12);
  const categoriaSlug = params?.categoriaSlug;

  const productoRepository = new ProductoRepository(supabase);

  // Query base con relaciones
  const start = (page - 1) * pageSize;

  const { items, total } = await productoRepository.findAll({
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
 * @param params - Optional parameters for filtering and pagination
 * @returns Lista de productos completos (destacados primero, luego por nombre)
 */
export async function getProductos(
  params?: GetProductosParams,
): Promise<PaginatedResult<ProductoCompleto>> {
  const supabase = await createClient();

  const cachedFn = createCachedQuery<
    [SupabaseClient, GetProductosParams?],
    PaginatedResult<ProductoCompleto>
  >(getProductosInternal, CACHE_CONFIG.productos);

  return cachedFn(supabase, params);
}

/**
 * Obtiene productos sin cache (para admin)
 * @param params - Optional parameters for filtering and pagination
 * @returns Lista de productos completos (destacados primero, luego por nombre)
 */
export async function getProductosFresh(
  params?: GetProductosParams,
): Promise<PaginatedResult<ProductoCompleto>> {
  const supabase = await createClient();
  return getProductosInternal(supabase, params);
}

/**
 * Obtiene un producto por su slug (implementación interna)
 * @param supabase - Supabase client instance
 * @param slug - Slug único del producto
 * @returns Producto completo o null si no existe/inactivo
 */
async function getProductoBySlugInternal(
  supabase: SupabaseClient,
  slug: string,
): Promise<ProductoCompleto | null> {
  const productoRepository = new ProductoRepository(supabase);
  return productoRepository.findBySlug(slug);
}

/**
 * Obtiene un producto por su slug (con cache)
 * @param slug - Slug único del producto
 * @returns Producto completo o null si no existe/inactivo
 */
export async function getProductoBySlug(
  slug: string,
): Promise<ProductoCompleto | null> {
  const supabase = await createClient();

  const cachedFn = createCachedQuery<
    [SupabaseClient, string],
    ProductoCompleto | null
  >(getProductoBySlugInternal, CACHE_CONFIG.producto_detail);

  return cachedFn(supabase, slug);
}

/**
 * Obtiene un producto por su slug sin cache (para admin)
 * @param slug - Slug único del producto
 * @returns Producto completo o null si no existe/inactivo
 */
export async function getProductoBySlugFresh(
  slug: string,
): Promise<ProductoCompleto | null> {
  const supabase = await createClient();
  return getProductoBySlugInternal(supabase, slug);
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
