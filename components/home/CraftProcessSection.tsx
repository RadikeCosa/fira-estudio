import Image from "next/image";
import Link from "next/link";

export function CraftProcessSection() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
          <Image
            src="/images/about.webp"
            alt="Manos marcando una tela junto a una máquina de coser"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Hecho en el taller
          </p>
          <h2 className="mb-5 text-3xl leading-tight text-foreground sm:text-4xl">
            Del diseño a cada terminación
          </h2>
          <p className="mb-7 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Elegimos las telas, diseñamos cada pieza y trabajamos la confección
            y la serigrafía manual con cuidado en las terminaciones.
          </p>
          <Link
            href="/sobre-nosotros"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
          >
            Conocé nuestro proceso
          </Link>
        </div>
      </div>
    </section>
  );
}
