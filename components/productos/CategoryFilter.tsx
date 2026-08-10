/**
 * Category filter component
 * Horizontal scrolling tabs for filtering products by category
 */

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Categoria } from "@/lib/types";
import { trackCategoryFilter } from "@/lib/analytics/gtag";
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categorias: Categoria[];
}

/**
 * Category filter with horizontal scrolling
 * Client component to handle active state and tracking
 */
export function CategoryFilter({ categorias }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("categoria");

  // TODO: Performance optimization - Implement useCallback in future global optimization
  // This will prevent unnecessary re-renders by memoizing the handler function
  // const handleCategoryClick = useCallback((slug: string, nombre: string): void => {
  //   trackCategoryFilter(slug, nombre);
  // }, []);
  const handleCategoryClick = (slug: string, nombre: string): void => {
    // Track category filter usage
    trackCategoryFilter(slug, nombre);
  };

  // Early return if no categories to display
  if (!categorias.length) {
    return null;
  }

  return (
    <nav
      className={COMPONENTS.categoryFilter.container}
      aria-label="Filtrar productos por categoría"
    >
      <div
        className={COMPONENTS.categoryFilter.buttonList}
        role="tablist"
      >
        {/* "Todos" button */}
        <Link
          href="/productos"
          role="tab"
          aria-selected={!activeCategory}
          aria-current={!activeCategory ? "page" : undefined}
          onClick={() => handleCategoryClick("all", "Todos")}
          className={cn(
            COMPONENTS.categoryFilter.button,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !activeCategory
              ? COMPONENTS.categoryFilter.buttonActive
              : COMPONENTS.categoryFilter.buttonInactive
          )}
        >
          Todos
        </Link>

        {/* Category buttons */}
        {categorias.map((categoria) => {
          const isActive = activeCategory === categoria.slug;

          return (
            <Link
              key={categoria.id}
              href={`/productos?categoria=${categoria.slug}`}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              onClick={() =>
                handleCategoryClick(categoria.slug, categoria.nombre)
              }
              className={cn(
                COMPONENTS.categoryFilter.button,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? COMPONENTS.categoryFilter.buttonActive
                  : COMPONENTS.categoryFilter.buttonInactive
              )}
            >
              {categoria.nombre}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
