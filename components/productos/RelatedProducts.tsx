/**
 * Related Products component
 * Shows products from the same category
 */

import Link from "next/link";
import Image from "next/image";
import { getProductos } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";

interface RelatedProductsProps {
  productoId: string;
  categoriaId: string | null;
}

/**
 * Display related products from the same category
 * Server Component - fetches data directly
 */
export async function RelatedProducts({
  productoId,
  categoriaId,
}: RelatedProductsProps) {
  // If no category, don't show related products
  if (!categoriaId) return null;

  // Fetch all products (will filter on client side for simplicity)
  const allProductos = await getProductos();

  // Filter to same category, exclude current product, limit to 4
  const related = allProductos
    .filter(
      (p) => p.categoria_id === categoriaId && p.id !== productoId && p.activo
    )
    .slice(0, 4);

  // If no related products, don't render
  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t">
      <h2 className="text-2xl font-bold mb-8">Productos Relacionados</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {related.map((producto) => {
          const mainImage =
            producto.imagenes.find((img) => img.es_principal) ||
            producto.imagenes[0];

          return (
            <Link
              key={producto.id}
              href={`/productos/${producto.slug}`}
              className="group"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
                {mainImage ? (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt_text || producto.nombre}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sin imagen
                  </div>
                )}
              </div>

              <h3 className="font-medium text-sm mb-1 group-hover:text-foreground/80 transition-colors">
                {producto.nombre}
              </h3>

              {producto.precio_desde && (
                <p className="text-sm text-muted-foreground">
                  Desde {formatPrice(producto.precio_desde)}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
