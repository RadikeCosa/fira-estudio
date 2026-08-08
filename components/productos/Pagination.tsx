/**
 * Pagination component for product listing
 */
import Link from "next/link";
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  categoriaSlug?: string;
}

export function Pagination({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  categoriaSlug,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const displayTotalPages = totalPages === 0 ? 1 : totalPages;

  const buildHref = (targetPage: number): string => {
    const params = new URLSearchParams();

    if (categoriaSlug) {
      params.set("categoria", categoriaSlug);
    }

    if (targetPage > 1) {
      params.set("page", targetPage.toString());
    }

    const queryString = params.toString();
    return queryString ? `/productos?${queryString}` : "/productos";
  };

  const previousHref = buildHref(Math.max(1, page - 1));
  const nextHref = buildHref(page + 1);
  const disabledButtonClass = cn(
    COMPONENTS.pagination.button,
    COMPONENTS.pagination.buttonDisabled,
  );
  const activeButtonClass = cn(
    COMPONENTS.pagination.button,
    COMPONENTS.pagination.buttonActive,
  );

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
    >
      {hasPreviousPage ? (
        <Link
          href={previousHref}
          aria-label="Ir a la página anterior"
          className={activeButtonClass}
        >
          Anterior
        </Link>
      ) : (
        <span className={disabledButtonClass} aria-hidden="true">
          Anterior
        </span>
      )}

      <span className={COMPONENTS.pagination.pageInfo} aria-current="page">
        Página {page} de {displayTotalPages}
      </span>

      {hasNextPage ? (
        <Link
          href={nextHref}
          aria-label="Ir a la página siguiente"
          className={activeButtonClass}
        >
          Siguiente
        </Link>
      ) : (
        <span className={disabledButtonClass} aria-hidden="true">
          Siguiente
        </span>
      )}
    </nav>
  );
}
