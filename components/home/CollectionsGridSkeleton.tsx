import { LAYOUT, SPACING, ANIMATIONS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * CollectionsGridSkeleton - Loading skeleton para CollectionsGrid
 * Renders 6 placeholder cards matching grid layout (2x2 mobile, 3x2 desktop)
 */

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-white shadow-card",
        featured ? "border-accent/30 ring-1 ring-accent/10" : "",
      )}
    >
      {/* Image Skeleton */}
      <div
        className={cn(
          "relative overflow-hidden bg-linear-to-br from-muted/50 to-muted",
          featured ? "aspect-video" : "aspect-2/3",
        )}
      >
        {/* Shimmer overlay */}
        <div
          className={cn("absolute inset-0", ANIMATIONS.shimmer)}
          aria-hidden="true"
        />
      </div>

      {/* Text Skeleton */}
      <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/50 via-black/20 to-transparent p-6 sm:p-8">
        {/* Title */}
        <div className="mb-2 h-8 w-3/4 rounded bg-white/20 sm:h-10" />
        {/* Description */}
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-white/15" />
          <div className="h-4 w-5/6 rounded bg-white/15" />
        </div>
        {/* CTA */}
        <div className="h-5 w-32 rounded bg-white/20" />
      </div>
    </div>
  );
}

export function CollectionsGridSkeleton() {
  return (
    <section
      className={cn(SPACING.sectionPadding.sm, "bg-muted/30")}
      role="region"
      aria-busy="true"
      aria-label="Cargando colecciones"
    >
      <div className={LAYOUT.container.maxW7xl}>
        {/* Section Header Skeleton */}
        <div className="mb-12 space-y-4 text-center">
          <div className="mx-auto h-10 w-48 rounded bg-muted" />
          <div className="mx-auto h-6 w-64 rounded bg-muted" />
        </div>

        {/* Collections Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard
              key={`skeleton-${idx}`}
              featured={idx === 0} // Primera tarjeta como featured
            />
          ))}
        </div>
      </div>
    </section>
  );
}
