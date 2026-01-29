import { LAYOUT, SPACING } from "@/lib/design/tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/productos/ProductCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { cn, getPrincipalImage } from "@/lib/utils";
import { getProductos } from "@/lib/supabase/queries";

/**
 * FeaturedProducts - Grid de productos destacados con layout offset
 *
 * Muestra productos con `destacado = true` de la base de datos
 * con un diseño escalonado (staggered) para visual interés.
 *
 * Layout:
 * [Product 1]
 *     [Product 2] (offset)
 * [Product 3]
 *     [Product 4] (offset)
 */

interface FeaturedProductsProps {
  /**
   * Número máximo de productos a mostrar (default: 4)
   */
  limit?: number;
}

export async function FeaturedProducts({ limit = 4 }: FeaturedProductsProps) {
  // Fetch featured products from database
  const productosResult = await getProductos({
    destacado: true,
    page: 1,
    pageSize: limit,
  });
  const productosDestacados = productosResult.items;

  // Don't render section if no featured products
  if (productosDestacados.length === 0) {
    return null;
  }

  return (
    <section className={cn(SPACING.sectionPadding.sm, "bg-background")}>
      <div className={LAYOUT.container.maxW7xl}>
        {/* Section Header */}
        <SectionHeader
          title="Productos Destacados"
          description="Nuestras piezas más especiales, creadas con dedicación y amor por el detalle"
        />

        {/* Products Grid with Offset Layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {productosDestacados.map((producto, index) => {
            const imagenPrincipal = getPrincipalImage(producto.imagenes ?? []);

            // Apply offset to odd-indexed items (2nd, 4th)
            const isOffset = index % 2 === 1;

            return (
              <div
                key={producto.id}
                className={cn(
                  "shine-effect rounded-2xl transition-all duration-300",
                  isOffset && "sm:mt-12", // Offset on medium+ screens
                )}
              >
                <ProductCard
                  producto={producto}
                  imagenPrincipal={imagenPrincipal?.url}
                  imagenAlt={imagenPrincipal?.alt_text}
                />
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-16 text-center">
          <Button href="/productos" variant="ghost" className="group">
            Ver todos los productos
            <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </section>
  );
}
