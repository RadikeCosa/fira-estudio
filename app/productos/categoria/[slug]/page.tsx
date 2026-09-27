import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryFilter } from "@/components/productos/CategoryFilter";
import { Pagination } from "@/components/productos/Pagination";
import { ProductGrid } from "@/components/productos/ProductGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCategorias, getProductos } from "@/lib/supabase/queries";
import { buildMetadata } from "@/lib/seo/metadata";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const categorias = await getCategorias();
  const categoria = categorias.find((item) => item.slug === slug);

  if (!categoria) {
    return buildMetadata({
      title: "Categoría no encontrada",
      description: "No encontramos esta categoría del catálogo.",
      url: `/productos/categoria/${slug}`,
      noIndex: true,
    });
  }

  const page = Number(firstParam(query.page) ?? "1");
  const validPage = Number.isInteger(page) && page > 0;
  const hasUnknownParams = Object.keys(query).some((key) => key !== "page");

  return buildMetadata({
    title: categoria.nombre,
    description: categoria.descripcion || `Textiles artesanales de ${categoria.nombre}.`,
    url: `/productos/categoria/${slug}`,
    noIndex: hasUnknownParams || !validPage || page > 1,
    follow: true,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query, categorias] = await Promise.all([
    params,
    searchParams,
    getCategorias(),
  ]);
  const categoria = categorias.find((item) => item.slug === slug);
  if (!categoria) notFound();

  const pageValue = Number(firstParam(query.page) ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = 12;
  const { items, pagination } = await getProductos({
    categoriaSlug: categoria.slug,
    page,
    pageSize,
  });

  if (page > 1 && page > pagination.totalPages) notFound();

  const basePath = `/productos/categoria/${categoria.slug}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <Breadcrumbs
        items={[
          { name: "Productos", url: "/productos" },
          { name: categoria.nombre, url: basePath },
        ]}
      />
      <PageHeader
        title={categoria.nombre}
        description={categoria.descripcion || "Piezas textiles hechas para usar cada día."}
      />
      <CategoryFilter categorias={categorias} activeCategorySlug={slug} />
      <ProductGrid
        productos={items}
        emptyTitle={`Todavía no hay piezas en ${categoria.nombre}`}
        emptyDescription="Mientras tanto, podés recorrer el catálogo completo."
        emptyHref="/productos"
        emptyLinkText="Ver todos los productos"
      />
      <div className="mt-12 flex justify-center">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          basePath={basePath}
        />
      </div>
    </div>
  );
}
