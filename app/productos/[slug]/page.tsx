import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductoBySlug } from "@/lib/supabase/queries";
import { ProductGallery } from "@/components/productos/ProductGallery";
import { ProductInfo } from "@/components/productos/ProductInfo";
import { ProductActions } from "@/components/productos/ProductActions";

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

  return {
    title: producto.nombre,
    description: description,
  };
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

  return (
    <main className="min-h-screen py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4">
        <div
          className="
          grid grid-cols-1 md:grid-cols-2
          gap-8 md:gap-12
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
      </div>
    </main>
  );
}
