/**
 * Category filter component
 * Horizontal scrolling tabs for filtering products by category
 */

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Categoria } from "@/lib/types";
import { trackCategoryFilter } from "@/lib/analytics/gtag";

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

  const handleCategoryClick = (slug: string, nombre: string) => {
    // Track category filter usage
    trackCategoryFilter(slug, nombre);
  };

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-3 pb-2 min-w-max">
        {/* "Todos" button */}
        <Link
          href="/productos"
          onClick={() => handleCategoryClick("all", "Todos")}
          className={`
            px-5 py-2.5 rounded-full
            font-medium text-sm
            transition-all duration-200
            whitespace-nowrap
            ${
              !activeCategory
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }
          `}
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
              onClick={() =>
                handleCategoryClick(categoria.slug, categoria.nombre)
              }
              className={`
                px-5 py-2.5 rounded-full
                font-medium text-sm
                transition-all duration-200
                whitespace-nowrap
                ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              {categoria.nombre}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
