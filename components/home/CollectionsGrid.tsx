import { LAYOUT, SPACING, ANIMATIONS } from "@/lib/design/tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

/**
 * CollectionsGrid - Grid 2x2 de colecciones con manteles full-width
 * 
 * Layout:
 * ┌─────────────────────┐
 * │     Manteles        │  (full-width)
 * └─────────────────────┘
 * ┌──────────┬──────────┐
 * │Servilleta│ Caminos  │  (2 columns)
 * └──────────┴──────────┘
 */

interface Collection {
  name: string;
  slug: string;
  image: string;
  description: string;
  featured?: boolean; // Si es true, ocupa full-width
}

const COLLECTIONS: Collection[] = [
  {
    name: "Manteles",
    slug: "manteles",
    // Temporary: Use existing product image until real collection image is added
    image: "/images/productos/manteles/mantel-beige.jpg",
    description: "Para darle un toque especial a tu mesa",
    featured: true, // Full-width
  },
  {
    name: "Servilletas",
    slug: "servilletas",
    // Temporary: Use existing product image until real collection image is added
    image: "/images/productos/servilletas/servilleta-azul.jpg",
    description: "Ideales para acompañar tus comidas y reuniones",
  },
  {
    name: "Caminos de Mesa",
    slug: "caminos",
    // Temporary: Use existing product image until real collection image is added
    image: "/images/productos/caminos/camino-blanco (1).jpg",
    description: "El detalle perfecto para realzar cualquier ambiente",
  },
];

interface CollectionCardProps {
  collection: Collection;
  featured?: boolean;
}

function CollectionCard({ collection, featured = false }: CollectionCardProps) {
  return (
    <Link
      href={`/productos?categoria=${collection.slug}`}
      className={cn(
        "group shine-effect overflow-hidden rounded-2xl border border-border/50 bg-white shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-foreground/10 hover:-translate-y-2",
        featured && "sm:col-span-2", // Full-width on medium+ screens
      )}
    >
      {/* Image Container */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted",
          featured ? "aspect-[21/9]" : "aspect-[2/3]", // Panoramic vs Portrait
        )}
      >
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 80vw"
              : "(max-width: 640px) 100vw, 40vw"
          }
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <h3
            className={cn(
              "mb-2 font-bold text-white transition-all duration-300 group-hover:translate-y-[-4px]",
              featured ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
            )}
          >
            {collection.name}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-white/90 sm:text-base">
            {collection.description}
          </p>
          {/* Arrow Icon */}
          <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <span>Explorar colección</span>
            <ArrowRight
              className={cn(
                "h-5 w-5 transition-all",
                ANIMATIONS.hoverIcon,
                "group-hover:text-white",
              )}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CollectionsGrid() {
  return (
    <section className={cn(SPACING.sectionPadding.sm, "bg-muted/30")}>
      <div className={LAYOUT.container.maxW7xl}>
        {/* Section Header */}
        <SectionHeader
          title="Nuestras Colecciones"
          description="Explora nuestra colección de textiles artesanales"
        />

        {/* Collections Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {COLLECTIONS.map((collection) => (
            <CollectionCard
              key={collection.slug}
              collection={collection}
              featured={collection.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
