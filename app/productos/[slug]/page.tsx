import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductoBySlug } from "@/lib/supabase/queries";
import { ProductGallery } from "@/components/productos/ProductGallery";
import { ProductInfo } from "@/components/productos/ProductInfo";
import { ProductActions } from "@/components/productos/ProductActions";
import { RelatedProducts } from "@/components/productos/RelatedProducts";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  generateProductSchema,
  renderJsonLd,
} from "@/lib/seo/structured-data";
import { SITE_CONFIG } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo/metadata";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

/**
 * Genera metadata dinámica para el producto
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) {
    return {
      title: "Producto no encontrado",
    };
  }

  // Truncar descripción a 160 caracteres para meta description
  const description =
    producto.descripcion.length > 160
      ? `${producto.descripcion.substring(0, 157)}...`
      : producto.descripcion;

  // Get main image for OpenGraph
  const mainImage =
    producto.imagenes.find((img) => img.es_principal)?.url ||
    producto.imagenes[0]?.url;

  return buildMetadata({
    title: producto.nombre,
    description,
    image: mainImage ? `${SITE_CONFIG.url}${mainImage}` : undefined,
  });
}

/**
 * Página de detalle de producto
 *
 * Muestra galería, información y selector de variaciones
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  // Si no existe el producto, mostrar 404
  if (!producto) {
    notFound();
  }

  // Generate structured data for SEO
  const productSchema = generateProductSchema(producto);

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: "Productos", url: "/productos" },
    { name: producto.nombre, url: `/productos/${producto.slug}` },
  ];

  return (
    <>
      {/* JSON-LD structured data */}
      <script {...renderJsonLd(productSchema)} />

      <main className="min-h-screen py-12 md:py-16 lg:py-20 bg-linear-to-b from-white to-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          <div
            className="
          grid grid-cols-1 md:grid-cols-2
          gap-10 md:gap-12 lg:gap-16
        "
          >
            {/* Columna izquierda: Galería de imágenes */}
            <div className="w-full">
              <ProductGallery imagenes={producto.imagenes} />
            </div>

            {/* Columna derecha: Información y acciones */}
            <div
              className="
            flex flex-col gap-8
          "
            >
              <ProductInfo producto={producto} />

              {/* Selector de variaciones y botón de WhatsApp */}
              <ProductActions
                producto={producto}
                variaciones={producto.variaciones}
              />
            </div>
          </div>

          {/* Productos relacionados */}
          <RelatedProducts
            productoId={producto.id}
            categoriaId={producto.categoria_id}
          />
        </div>
      </main>
    </>
  );
}
