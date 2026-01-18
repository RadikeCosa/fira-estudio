import { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import { getProductos } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/productos/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DecorativeBadge } from "@/components/ui/DecorativeBadge";
import { SITE_CONFIG } from "@/lib/constants";
import {
  generateOrganizationSchema,
  renderJsonLd,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - Textiles Artesanales`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - Textiles Artesanales`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - Textiles Artesanales`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/og-image.jpg`],
  },
};

export default async function Home() {
  // Obtener productos destacados
  const productosResult = await getProductos({ page: 1, pageSize: 50 });
  const productosDestacados = productosResult.items
    .filter((p) => p.destacado)
    .slice(0, 4);

  // Generate Organization schema for SEO
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* JSON-LD structured data for organization */}
      <script {...renderJsonLd(organizationSchema)} />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section
          className="
          relative
          bg-gradient-to-b from-muted/50 via-background to-background
          px-4 py-20
          sm:px-6 sm:py-28
          lg:px-8 lg:py-36
          overflow-hidden
        "
        >
          {/* Decorative gradient blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div
              className="
              absolute -top-40 -right-40
              h-96 w-96
              rounded-full
              bg-gradient-to-br from-muted to-transparent
              opacity-40
              blur-3xl
            "
            />
            <div
              className="
              absolute -bottom-40 -left-40
              h-96 w-96
              rounded-full
              bg-gradient-to-tr from-muted to-transparent
              opacity-40
              blur-3xl
            "
            />
          </div>

          <div className="mx-auto max-w-4xl text-center relative z-10">
            {/* Badge */}
            <div
              className="
              mb-8
              inline-flex items-center gap-2
              rounded-full
              border border-border/50
              bg-white/80
              backdrop-blur-sm
              px-5 py-2.5
              text-sm
              font-medium
              text-accent
              shadow-sm
              transition-all
              duration-300
              hover:shadow-md
              hover:border-border
              animate-pulse
            "
            >
              <Sparkles className="h-4 w-4 text-foreground" />
              <span>Textiles Artesanales Únicos</span>
            </div>

            {/* Título principal */}
            <h1
              className="
              mb-6
              text-5xl
              font-bold
              tracking-tight
              bg-clip-text text-transparent
              bg-gradient-to-r from-foreground via-foreground to-foreground/70
              sm:text-6xl
              lg:text-7xl
              animate-in fade-in
              duration-700
            "
            >
              {SITE_CONFIG.name}
            </h1>

            {/* Subtítulo */}
            <p
              className="
              mb-5
              text-xl
              font-medium
              text-foreground/80
              sm:text-2xl
              animate-in fade-in
              duration-700
              delay-150
            "
            >
              {SITE_CONFIG.tagline}
            </p>

            {/* Descripción */}
            <p
              className="
              mx-auto
              mb-12
              max-w-2xl
              text-base
              leading-relaxed
              text-muted-foreground
              sm:text-lg
              animate-in fade-in
              duration-700
              delay-300
            "
            >
              Creamos manteles, servilletas y caminos de mesa con dedicación
              artesanal. Cada pieza es única y diseñada para transformar tus
              espacios en lugares especiales.
            </p>

            {/* CTA Buttons */}
            <div
              className="
              flex flex-col gap-4
              sm:flex-row sm:justify-center
              animate-in fade-in
              duration-700
              delay-500
            "
            >
              <Button href="/productos" variant="primary" size="md" className="group">
                Ver Productos
                <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:scale-110" />
              </Button>

              <Button href="/sobre-nosotros" variant="secondary" size="md">
                Sobre Nosotros
              </Button>
            </div>
          </div>
        </section>

        {/* Productos Destacados */}
        {productosDestacados.length > 0 && (
          <section
            className="
            mx-auto max-w-7xl
            px-4 py-20
            sm:px-6 sm:py-24
            lg:px-8 lg:py-28
          "
          >
            {/* Encabezado de sección */}
            <SectionHeader
              title="Productos Destacados"
              description="Nuestras piezas más especiales, creadas con dedicación y amor por el detalle"
            />

            {/* Grid de productos */}
            <div
              className="
              grid grid-cols-1
              gap-6
              sm:grid-cols-2
              lg:grid-cols-4
              lg:gap-8
            "
            >
              {productosDestacados.map((producto) => {
                const imagenPrincipal =
                  producto.imagenes?.find((img) => img.es_principal)?.url ||
                  producto.imagenes?.[0]?.url;

                return (
                  <div key={producto.id} className="shine-effect rounded-2xl">
                    <ProductCard
                      producto={producto}
                      imagenPrincipal={imagenPrincipal}
                    />
                  </div>
                );
              })}
            </div>

            {/* Link a todos los productos */}
            <div className="mt-16 text-center">
              <Button href="/productos" variant="ghost" className="group">
                Ver todos los productos
                <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:scale-110" />
              </Button>
            </div>
          </section>
        )}

        {/* Categorías */}
        <section
          className="
          bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30
          px-4 py-20
          sm:px-6 sm:py-24
          lg:px-8 lg:py-28
        "
        >
          <div className="mx-auto max-w-7xl">
            {/* Encabezado de sección */}
            <SectionHeader
              title="Nuestras Categorías"
              description="Explora nuestra colección de textiles artesanales"
            />

            {/* Grid de categorías */}
            <div
              className="
              grid grid-cols-1
              gap-6
              sm:grid-cols-3
              lg:gap-8
            "
            >
              {/* Manteles */}
              <Link
                href="/productos"
                className="
                group shine-effect
                overflow-hidden
                rounded-2xl
                border border-border/50
                bg-white
                shadow-card
                transition-all
                duration-300
                hover:shadow-card-hover
                hover:border-foreground/10
                hover:-translate-y-2
              "
              >
                <div
                  className="
                  aspect-[4/3]
                  overflow-hidden
                  bg-gradient-to-br from-muted/50 to-muted
                  relative
                "
                >
                  {/* Placeholder para imagen de categoría */}
                  <div
                    className="
                    flex h-full w-full
                    items-center justify-center
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                  >
                    <span
                      className="
                      text-5xl
                      font-bold
                      text-foreground/10
                      transition-all
                      duration-300
                      group-hover:text-foreground/20
                    "
                    >
                      Manteles
                    </span>
                  </div>
                  {/* Gradient overlay on hover */}
                  <div
                    className="
                    absolute inset-0
                    bg-gradient-to-t from-black/5 to-transparent
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                  />
                </div>
                <div className="p-6">
                  <h3
                    className="
                    mb-2
                    text-xl
                    font-bold
                    text-foreground
                    transition-colors
                    duration-300
                    group-hover:text-foreground/90
                  "
                  >
                    Manteles
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Para darle un toque especial a tu mesa
                  </p>
                </div>
              </Link>

              {/* Servilletas */}
              <Link
                href="/productos"
                className="
                group shine-effect
                overflow-hidden
                rounded-2xl
                border border-border/50
                bg-white
                shadow-card
                transition-all
                duration-300
                hover:shadow-card-hover
                hover:border-foreground/10
                hover:-translate-y-2
              "
              >
                <div
                  className="
                  aspect-[4/3]
                  overflow-hidden
                  bg-gradient-to-br from-muted/50 to-muted
                  relative
                "
                >
                  <div
                    className="
                    flex h-full w-full
                    items-center justify-center
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                  >
                    <span
                      className="
                      text-5xl
                      font-bold
                      text-foreground/10
                      transition-all
                      duration-300
                      group-hover:text-foreground/20
                    "
                    >
                      Servilletas
                    </span>
                  </div>
                  <div
                    className="
                    absolute inset-0
                    bg-gradient-to-t from-black/5 to-transparent
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                  />
                </div>
                <div className="p-6">
                  <h3
                    className="
                    mb-2
                    text-xl
                    font-bold
                    text-foreground
                    transition-colors
                    duration-300
                    group-hover:text-foreground/90
                  "
                  >
                    Servilletas
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Detalles que marcan la diferencia
                  </p>
                </div>
              </Link>

              {/* Caminos de Mesa */}
              <Link
                href="/productos"
                className="
                group shine-effect
                overflow-hidden
                rounded-2xl
                border border-border/50
                bg-white
                shadow-card
                transition-all
                duration-300
                hover:shadow-card-hover
                hover:border-foreground/10
                hover:-translate-y-2
              "
              >
                <div
                  className="
                  aspect-[4/3]
                  overflow-hidden
                  bg-gradient-to-br from-muted/50 to-muted
                  relative
                "
                >
                  <div
                    className="
                    flex h-full w-full
                    items-center justify-center
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                  >
                    <span
                      className="
                      text-5xl
                      font-bold
                      text-foreground/10
                      transition-all
                      duration-300
                      group-hover:text-foreground/20
                    "
                    >
                      Caminos
                    </span>
                  </div>
                  <div
                    className="
                    absolute inset-0
                    bg-gradient-to-t from-black/5 to-transparent
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                  />
                </div>
                <div className="p-6">
                  <h3
                    className="
                    mb-2
                    text-xl
                    font-bold
                    text-foreground
                    transition-colors
                    duration-300
                    group-hover:text-foreground/90
                  "
                  >
                    Caminos de Mesa
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Elegancia en cada detalle
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section
          className="
          mx-auto max-w-4xl
          px-4 py-20
          text-center
          sm:px-6 sm:py-24
          lg:px-8 lg:py-28
        "
        >
          <DecorativeBadge />
          <h2
            className="
            mb-6
            text-3xl
            font-bold
            text-foreground
            sm:text-4xl
          "
          >
            ¿Tenés alguna consulta?
          </h2>
          <p
            className="
            mb-10
            text-base
            leading-relaxed
            text-muted-foreground
            sm:text-lg
          "
          >
            Estamos para ayudarte a encontrar el producto perfecto para tu hogar
          </p>
          <Button href="/contacto" variant="primary" size="md" className="group">
            Contactanos
            <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:scale-110" />
          </Button>
        </section>
      </div>
    </>
  );
}
