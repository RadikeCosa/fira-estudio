import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductos, getCategorias } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/productos/ProductGrid";
import { CategoryFilter } from "@/components/productos/CategoryFilter";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/productos/Pagination";
import { buildMetadata } from "@/lib/seo/metadata";
import { PRODUCTOS_CONTENT } from "@/lib/content/productos";

interface ProductosPageProps {
  searchParams: Promise<ProductosSearchParams>;
}

type SearchParamValue = string | string[] | undefined;

type ProductosSearchParams = Record<string, SearchParamValue> & {
  categoria?: SearchParamValue;
  page?: SearchParamValue;
};

function getFirstParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hasSearchParams(params: ProductosSearchParams): boolean {
  return Object.keys(params).length > 0;
}

// ISR: Revalidar cada hora
export const revalidate = 3600;

// Metadata dinámica basada en categoría
export async function generateMetadata({
  searchParams,
}: ProductosPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasSeoRelevantQuery = hasSearchParams(params);

  return buildMetadata({
    title: PRODUCTOS_CONTENT.page.metadataTitle,
    description: PRODUCTOS_CONTENT.page.metadataDescription,
    url: "/productos",
    noIndex: hasSeoRelevantQuery,
    follow: true,
  });
}

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const params = await searchParams;

  const rawPageParam = getFirstParam(params.page);
  const pageParam = rawPageParam ? Number.parseInt(rawPageParam, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 12;

  // Paralelizar fetches para mejor performance
  const [productosResult, categorias] = await Promise.all([
    getProductos({
      page,
      pageSize,
    }),
    getCategorias(),
  ]);

  const { items: productos, pagination } = productosResult;

  if (page > 1 && page > pagination.totalPages) notFound();

  // Get content
  const { page: pageContent } = PRODUCTOS_CONTENT;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ name: "Productos", url: "/productos" }]} />

      {/* Page Header */}
      <PageHeader
        title={pageContent.defaultTitle}
        description={pageContent.defaultDescription}
      />

      {/* Category filter */}
      <CategoryFilter categorias={categorias} />

      {/* Grid de productos */}
      <ProductGrid productos={productos} />

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          basePath="/productos"
        />
      </div>
    </div>
  );
}
