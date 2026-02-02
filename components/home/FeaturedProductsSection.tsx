import { HOME_CONTENT } from "@/lib/content/home";
import { LAYOUT, SPACING } from "@/lib/design/tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/productos/ProductCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { cn, getPrincipalImage } from "@/lib/utils";
import type { ProductoCompleto } from "@/lib/types";

interface FeaturedProductsSectionProps {
  productos: ProductoCompleto[];
}

export function FeaturedProductsSection({
  productos,
}: FeaturedProductsSectionProps) {
  const { title, description, viewAllCta } = HOME_CONTENT.featuredProducts;

  if (!productos || productos.length === 0) return null;

  return (
    <section className={cn(SPACING.sectionPadding.sm)}>
      <div className={LAYOUT.container.maxW7xl}>
        <SectionHeader title={title} description={description} />
        <div className={LAYOUT.grid.products}>
          {productos.map((producto) => {
            const imagenPrincipal = getPrincipalImage(producto.imagenes ?? []);
            return (
              <div key={producto.id} className="shine-effect rounded-2xl">
                <ProductCard
                  producto={producto}
                  imagenPrincipal={imagenPrincipal?.url}
                  imagenAlt={imagenPrincipal?.alt_text}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-16 text-center">
          <Button href="/productos" variant="ghost" className="group">
            {viewAllCta}
            <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </section>
  );
}
