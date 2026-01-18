import { Metadata } from "next";
import { getProductos, getCategorias } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/productos/ProductGrid";
import { CategoryFilter } from "@/components/productos/CategoryFilter";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/productos/Pagination";
import {
  generateBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/seo/structured-data";
import { SITE_CONFIG } from "@/lib/constants";
import { PRODUCTOS_CONTENT } from "@/lib/content/productos";

interface ProductosPageProps {
  searchParams: {
    categoria?: string;
    page?: string;
  };
}

export const metadata: Metadata = {
  title: "Productos",
  description: SITE_CONFIG.description,
  openGraph: {
    title: `Productos | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
    type: "website",
    url: `${SITE_CONFIG.url}/productos`,
    siteName: SITE_CONFIG.name,
  },
};

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const params = await searchParams;
  const categoriaSlug = params.categoria;
  const pageParam = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 12;

  // Fetch products (filtered by category if provided)
  const productosResult = await getProductos({
    categoriaSlug,
    page,
    pageSize,
  });
  const { items: productos, pagination } = productosResult;

  // Fetch all categories for filter
  const categorias = await getCategorias();

  // Find active category name for display
  const activeCategoria = categorias.find((c) => c.slug === categoriaSlug);

  // Build breadcrumb items
  const breadcrumbItems = activeCategoria
    ? [
        { name: "Productos", url: "/productos" },
        {
          name: activeCategoria.nombre,
          url: `/productos?categoria=${activeCategoria.slug}`,
        },
      ]
    : [{ name: "Productos", url: "/productos" }];

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Get content
  const { page: pageContent } = PRODUCTOS_CONTENT;

  return (
    <>
      {/* JSON-LD structured data */}
      <script {...renderJsonLd(breadcrumbSchema)} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <PageHeader
          title={activeCategoria ? activeCategoria.nombre : pageContent.defaultTitle}
          description={
            activeCategoria
              ? activeCategoria.descripcion || pageContent.defaultDescription
              : pageContent.defaultDescription
          }
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
            categoriaSlug={categoriaSlug}
          />
        </div>
      </div>
    </>
  );
}
