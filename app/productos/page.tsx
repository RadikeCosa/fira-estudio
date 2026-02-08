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
import { buildMetadata } from "@/lib/seo/metadata";
import { PRODUCTOS_CONTENT } from "@/lib/content/productos";

interface ProductosPageProps {
  searchParams: Promise<{
    categoria?: string;
    page?: string;
  }>;
}

// ISR: Revalidar cada hora
export const revalidate = 3600;

// Metadata dinámica basada en categoría
export async function generateMetadata({
  searchParams,
}: ProductosPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categoriaSlug = params.categoria;

  // Si hay categoría, fetch para obtener nombre
  let categoriaName = PRODUCTOS_CONTENT.page.defaultTitle;
  let categoriaDescription: string = SITE_CONFIG.description;

  if (categoriaSlug) {
    try {
      const categorias = await getCategorias();
      const categoria = categorias.find((c) => c.slug === categoriaSlug);
      if (categoria) {
        categoriaName = categoria.nombre;
        categoriaDescription = categoria.descripcion || SITE_CONFIG.description;
      }
    } catch (error) {
      console.error("Error fetching category for metadata:", error);
    }
  }

  return buildMetadata({
    title: categoriaName,
    description: categoriaDescription,
    url: categoriaSlug
      ? `${SITE_CONFIG.url}/productos?categoria=${categoriaSlug}`
      : `${SITE_CONFIG.url}/productos`,
  });
}

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const params = await searchParams;

  // Validar y sanitizar categoriaSlug
  const rawCategoriaSlug = params.categoria;
  const categoriaSlug = rawCategoriaSlug?.match(/^[a-z0-9-]+$/)
    ? rawCategoriaSlug
    : undefined;

  const pageParam = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 12;

  // Paralelizar fetches para mejor performance
  const [productosResult, categorias] = await Promise.all([
    getProductos({
      categoriaSlug,
      page,
      pageSize,
    }),
    getCategorias(),
  ]);

  const { items: productos, pagination } = productosResult;

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
          title={
            activeCategoria ? activeCategoria.nombre : pageContent.defaultTitle
          }
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
