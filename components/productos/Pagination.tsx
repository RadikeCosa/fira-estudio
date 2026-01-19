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

  return (
    <nav aria-label="Paginación" className={COMPONENTS.pagination.nav}>
      <Link
        href={previousHref}
        aria-disabled={!hasPreviousPage}
        className={cn(
          COMPONENTS.pagination.button,
          hasPreviousPage 
            ? COMPONENTS.pagination.buttonActive 
            : COMPONENTS.pagination.buttonDisabled
        )}
      >
        Anterior
      </Link>

      <span className={COMPONENTS.pagination.pageInfo}>
        Página {page} de {displayTotalPages}
      </span>

      <Link
        href={nextHref}
        aria-disabled={!hasNextPage}
        className={cn(
          COMPONENTS.pagination.button,
          hasNextPage 
            ? COMPONENTS.pagination.buttonActive 
            : COMPONENTS.pagination.buttonDisabled
        )}
      >
        Siguiente
      </Link>
    </nav>
  );
}
