import { Metadata } from "next";
import { getProductos, getCategorias } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/productos/ProductGrid";
import { CategoryFilter } from "@/components/productos/CategoryFilter";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DecorativeBadge } from "@/components/ui/DecorativeBadge";
import { Pagination } from "@/components/productos/Pagination";
import {
  generateBreadcrumbSchema,
  renderJsonLd,
} from "@/lib/seo/structured-data";
import { SITE_CONFIG } from "@/lib/constants";

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

  return (
    <>
      {/* JSON-LD structured data */}
      <script {...renderJsonLd(breadcrumbSchema)} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Encabezado de la página */}
        <div className="mb-12 text-center">
          <DecorativeBadge />
          <h1
            className="
              mb-5
              text-4xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-5xl
            "
          >
            {activeCategoria ? activeCategoria.nombre : "Nuestros Productos"}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {activeCategoria
              ? activeCategoria.descripcion ||
                "Explora nuestra colección de productos."
              : "Textiles artesanales hechos a mano con dedicación y cuidado. Cada pieza es única y especial."}
          </p>
        </div>

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
