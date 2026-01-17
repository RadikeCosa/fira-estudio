import { Metadata } from "next";
import { getProductos, getCategorias } from "@/lib/supabase/queries";
import { ProductGrid } from "@/components/productos/ProductGrid";
import { CategoryFilter } from "@/components/productos/CategoryFilter";
import { SITE_CONFIG } from "@/lib/constants";

interface ProductosPageProps {
  searchParams: {
    categoria?: string;
  };
}

export const metadata: Metadata = {
  title: "Productos",
  description: SITE_CONFIG.description,
  openGraph: {
    title: `Productos | ${SITE_CONFIG.name}`,
    description: SITE_CONFIG.description,
  },
};

export default async function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  const params = await searchParams;
  const categoriaSlug = params.categoria;

  // Fetch products (filtered by category if provided)
  const productos = await getProductos(categoriaSlug);

  // Fetch all categories for filter
  const categorias = await getCategorias();

  // Find active category name for display
  const activeCategoria = categorias.find((c) => c.slug === categoriaSlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Encabezado de la página */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-block">
          <div
            className="
              inline-flex h-1 w-16
              rounded-full
              bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20
            "
          />
        </div>
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
    </div>
  );
}
