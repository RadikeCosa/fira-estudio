import { LAYOUT, SPACING, ANIMATIONS } from "@/lib/design/tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getCategorias } from "@/lib/supabase/queries";
import type { Categoria } from "@/lib/types";
import { HOME_CONTENT } from "@/lib/content/home";

/**
 * CollectionsGrid - Grid 3-col en desktop para 6 categorías
 *
 * Layout:
 * MOBILE (1 col):     TABLET (2 col):         DESKTOP (3 col):
 * ┌─────┐             ┌────┬────┐             ┌────┬────┬────┐
 * │  1  │             │ 1  │ 2  │             │ 1* │ 2  │ 3  │ (* featured)
 * ├─────┤             ├────┼────┤             ├────┼────┼────┤
 * │  2  │             │ 3  │ 4  │             │ 4  │ 5  │ 6  │
 * ├─────┤             ├────┼────┤             └────┴────┴────┘
 * │  3  │             │ 5  │ 6  │
 * ├─────┤             └────┴────┘
 * │  4  │
 * ├─────┤
 * │  5  │
 * ├─────┤
 * │  6  │
 * └─────┘
 */

const PLACEHOLDER_IMAGE = "/images/placeholders/placeholder-image.jpeg";
// Minimal SVG blur placeholder
const PLACEHOLDER_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGZpbHRlciBpZD0iYiI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZTVlN2ViIiBmaWx0ZXI9InVybCgjYikiLz48L3N2Zz4=";

interface CollectionCardProps {
  collection: Categoria;
  featured?: boolean;
}

function CollectionCard({ collection, featured = false }: CollectionCardProps) {
  return (
    <Link
      href={`/productos?categoria=${collection.slug}`}
      className={cn(
        "group shine-effect overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2",
        featured
          ? "border-accent/50 shadow-card ring-2 ring-accent/20 hover:ring-accent/40 hover:scale-105"
          : "border-border/50 bg-white shadow-card hover:border-foreground/10",
      )}
      aria-label={`Explorar colección ${collection.nombre}`}
    >
      {/* Image Container */}
      <div className="relative aspect-2/3 overflow-hidden bg-linear-to-br from-muted/50 to-muted">
        {collection.imagen ? (
          <Image
            src={collection.imagen}
            alt={
              collection.nombre
                ? `Imagen de la colección ${collection.nombre}`
                : "Imagen de colección"
            }
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 45vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
            }
            priority={featured}
          />
        ) : (
          <Image
            src={PLACEHOLDER_IMAGE}
            alt={
              collection.nombre
                ? `Imagen de la colección ${collection.nombre}`
                : "Imagen de colección"
            }
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 45vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
            }
            priority={featured}
            placeholder="blur"
            blurDataURL={PLACEHOLDER_BLUR}
          />
        )}
        {/* Gradient Overlay: asegurar contraste */}
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"
          aria-hidden="true"
        />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <h3
            className={cn(
              "mb-2 font-bold text-white transition-all duration-300 group-hover:-translate-y-1",
              featured ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
            )}
            id={`collection-title-${collection.slug}`}
          >
            {collection.nombre}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-white/90 sm:text-base">
            {collection.descripcion}
          </p>
          {/* Arrow Icon */}
          <div
            className="inline-flex items-center gap-2 text-sm font-medium text-white"
            aria-label="Explorar colección"
            role="button"
          >
            <span>Explorar colección</span>
            <ArrowRight
              className={cn(
                "h-5 w-5 transition-all",
                ANIMATIONS.hoverIcon,
                "group-hover:text-white",
              )}
              aria-hidden="true"
              focusable="false"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function CollectionsGrid() {
  let categorias: Categoria[] | null = null;
  let error: Error | null = null;

  try {
    categorias = await getCategorias();
  } catch (err) {
    error = err as Error;
    console.error("Error al cargar categorías:", error.message);
  }

  // Render error state with message
  if (error && !categorias?.length) {
    return (
      <section
        className={cn(SPACING.sectionPadding.sm, "bg-muted/30")}
        role="region"
        aria-labelledby="collections-section-title"
      >
        <div className={LAYOUT.container.maxW7xl}>
          <h2 id="collections-section-title" className="sr-only">
            {HOME_CONTENT.categories.title}
          </h2>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-sm text-destructive">
              No pudimos cargar las colecciones. Intenta recargar la página.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Return null if no categories
  if (!categorias?.length) {
    return null;
  }
  return (
    <section
      className={cn(SPACING.sectionPadding.sm, "bg-muted/30")}
      role="region"
      aria-labelledby="collections-section-title"
    >
      <div className={LAYOUT.container.maxW7xl}>
        {/* Section Header */}

        {/* Heading oculto para aria-labelledby */}
        <h2 id="collections-section-title" className="sr-only">
          {HOME_CONTENT.categories.title}
        </h2>
        <SectionHeader
          title={HOME_CONTENT.categories.title}
          description={HOME_CONTENT.categories.description}
        />

        {/* Collections Grid - 3 columns desktop for 6 items (2 rows) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {categorias.map((collection) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              featured={!!collection.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
