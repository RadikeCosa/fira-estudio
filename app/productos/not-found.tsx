import Link from "next/link";

export default function CatalogNotFound() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-accent">
        Catálogo
      </p>
      <h1 className="mb-5 text-4xl text-foreground sm:text-5xl">
        Esa página del catálogo no existe
      </h1>
      <p className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
        Volvé al catálogo y seguí explorando las piezas disponibles.
      </p>
      <Link
        href="/productos"
        className="inline-flex min-h-12 items-center rounded-md bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        Ver catálogo
      </Link>
    </section>
  );
}
