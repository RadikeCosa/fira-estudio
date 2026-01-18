/**
 * Producto repository backed by Supabase
 */
import { createClient } from "@/lib/supabase/server";
import type { ProductoCompleto } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { RepositoryError } from "./errors";
import { createCachedQuery, CACHE_CONFIG } from "@/lib/cache";

interface ProductoFilter {
  categoria?: string;
  limit?: number;
  offset?: number;
}

export class ProductoRepository extends BaseRepository<ProductoCompleto> {
  /**
   * Fetch products with optional category slug, pagination via limit/offset
   */
  async findAll(
    filter?: ProductoFilter,
  ): Promise<{ items: ProductoCompleto[]; total: number }> {
    const supabase = await createClient();

    const limit = filter?.limit ?? null;
    const offset = filter?.offset ?? 0;
    const categoriaSlug = filter?.categoria;

    let query = supabase
      .from("productos")
      .select(
        `
        *,
        categoria:categorias(*),
        variaciones(*),
        imagenes:imagenes_producto(*)
      `,
        { count: "exact" },
      )
      .eq("activo", true)
      .order("destacado", { ascending: false })
      .order("nombre", { ascending: true });

    if (categoriaSlug) {
      const { data: categoria, error: categoriaError } = await supabase
        .from("categorias")
        .select("id")
        .eq("slug", categoriaSlug)
        .single();

      if (categoriaError && categoriaError.code !== "PGRST116") {
        throw new RepositoryError("Failed to fetch category", {
          code: categoriaError.code,
          originalError: categoriaError,
        });
      }

      if (!categoria) {
        return { items: [], total: 0 };
      }

      query = query.eq("categoria_id", categoria.id);
    }

    if (limit !== null) {
      const to = offset + limit - 1;
      query = query.range(offset, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new RepositoryError("Failed to fetch products", {
        code: error.code,
        originalError: error,
      });
    }

    const productos = (data as ProductoCompleto[] | null) ?? [];
    const sorted = productos.map((producto) => this.sortRelations(producto));

    return {
      items: sorted,
      total: count ?? sorted.length,
    };
  }

  /**
   * Cached version of findAll for public-facing pages
   * Uses Next.js cache with 1 hour revalidation
   */
  findAllCached = createCachedQuery<
    [ProductoFilter?],
    { items: ProductoCompleto[]; total: number }
  >(
    (filter?: ProductoFilter) => this.findAll(filter),
    CACHE_CONFIG.productos,
  );

  /**
   * Find a product by its ID
   */
  async findById(id: string): Promise<ProductoCompleto | null> {
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
      .eq("id", id)
      .eq("activo", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new RepositoryError("Failed to fetch product by id", {
        code: error.code,
        originalError: error,
      });
    }

    return this.sortRelations(data as ProductoCompleto);
  }

  /**
   * Find a product by its slug
   */
  async findBySlug(slug: string): Promise<ProductoCompleto | null> {
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
      .eq("slug", slug)
      .eq("activo", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new RepositoryError("Failed to fetch product by slug", {
        code: error.code,
        originalError: error,
      });
    }

    return this.sortRelations(data as ProductoCompleto);
  }

  /**
   * Cached version of findBySlug for product detail pages
   * Uses Next.js cache with 30 minute revalidation
   */
  findBySlugCached = createCachedQuery<[string], ProductoCompleto | null>(
    (slug: string) => this.findBySlug(slug),
    CACHE_CONFIG.producto_detail,
  );

  // The following methods are not implemented for now in this repository
  async create(): Promise<ProductoCompleto> {
    throw new RepositoryError("Create product not implemented");
  }

  async update(): Promise<ProductoCompleto> {
    throw new RepositoryError("Update product not implemented");
  }

  async delete(): Promise<void> {
    throw new RepositoryError("Delete product not implemented");
  }

  /**
   * Sort related collections for stable ordering
   */
  private sortRelations(producto: ProductoCompleto): ProductoCompleto {
    return {
      ...producto,
      variaciones: [...producto.variaciones].sort((a, b) => {
        const sizeCompare = a.tamanio.localeCompare(b.tamanio);
        if (sizeCompare !== 0) return sizeCompare;
        return a.color.localeCompare(b.color);
      }),
      imagenes: [...producto.imagenes].sort((a, b) => a.orden - b.orden),
    };
  }
}
