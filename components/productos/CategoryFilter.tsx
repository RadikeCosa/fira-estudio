/**
 * Category filter component
 * Navigation links for browsing catalog categories
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Categoria } from "@/lib/types";
import { trackCategoryFilter } from "@/lib/analytics/gtag";
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categorias: Categoria[];
  activeCategorySlug?: string;
}

/**
 * Category filter with horizontal scrolling
 * Client component to handle active state and tracking
 */
export function CategoryFilter({
  categorias,
  activeCategorySlug,
}: CategoryFilterProps) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");

  // TODO: Performance optimization - Implement useCallback in future global optimization
  // This will prevent unnecessary re-renders by memoizing the handler function
  // const handleCategoryClick = useCallback((slug: string, nombre: string): void => {
  //   trackCategoryFilter(slug, nombre);
  // }, []);
  const handleCategoryClick = (slug: string, nombre: string): void => {
    trackCategoryFilter(slug, nombre);
  };

  const navigateToCategory = (slug: string, nombre: string): void => {
    setAnnouncement(`Abriendo categoría ${nombre}`);
    handleCategoryClick(slug || "all", nombre);
    router.push(slug ? `/productos/categoria/${slug}` : "/productos");
  };

  // Early return if no categories to display
  if (!categorias.length) {
    return null;
  }

  return (
    <nav className="mb-10" aria-label="Categorías del catálogo">
      <p className="mb-3 text-sm font-medium text-muted-foreground md:hidden">
        Explorar por categoría
      </p>
      <label className="sr-only" htmlFor="catalog-category-mobile">
        Elegí una categoría
      </label>
      <select
        id="catalog-category-mobile"
        value={activeCategorySlug ?? ""}
        onChange={(event) => {
          const category = categorias.find(
            (item) => item.slug === event.currentTarget.value,
          );
          navigateToCategory(category?.slug ?? "", category?.nombre ?? "Todos");
        }}
        className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring md:hidden"
      >
        <option value="">Todos los productos</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.slug}>
            {categoria.nombre}
          </option>
        ))}
      </select>

      <div className="hidden flex-wrap gap-2 md:flex">
        <Link
          href="/productos"
          aria-current={!activeCategorySlug ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            navigateToCategory("", "Todos");
          }}
          className={cn(
            COMPONENTS.categoryFilter.button,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !activeCategorySlug
              ? COMPONENTS.categoryFilter.buttonActive
              : COMPONENTS.categoryFilter.buttonInactive
          )}
        >
          Todos
        </Link>

        {/* Category buttons */}
        {categorias.map((categoria) => {
          const isActive = activeCategorySlug === categoria.slug;

          return (
            <Link
              key={categoria.id}
              href={`/productos/categoria/${categoria.slug}`}
              aria-current={isActive ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigateToCategory(categoria.slug, categoria.nombre);
              }}
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
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </nav>
  );
}
