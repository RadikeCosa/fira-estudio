/**
 * Cache revalidation functions
 * Use these to invalidate cache after mutations
 */

import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Revalidates all productos cache
 * Use after bulk product updates or category changes
 * 
 * @example
 * await updateMultipleProductos(data);
 * revalidateProductos();
 */
export function revalidateProductos(): void {
  revalidateTag("productos", "default");
  revalidatePath("/productos");
}

/**
 * Revalidates a specific product by slug
 * Use after single product update
 * 
 * @param slug - Product slug to revalidate
 * 
 * @example
 * await updateProducto(id, data);
 * revalidateProducto(producto.slug);
 */
export function revalidateProducto(slug: string): void {
  revalidateTag("productos", "default");
  revalidatePath(`/productos/${slug}`);
  revalidatePath("/productos");
}

/**
 * Revalidates all categorias cache
 * Use after category updates
 * 
 * @example
 * await updateCategoria(id, data);
 * revalidateCategorias();
 */
export function revalidateCategorias(): void {
  revalidateTag("categorias", "default");
  revalidatePath("/productos");
}
