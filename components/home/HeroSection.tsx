import { HOME_CONTENT } from "@/lib/content/home";
import { ANIMATIONS } from "@/lib/design/tokens";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeroSectionProps {
  customClassName?: string;
}

export function HeroSection({ customClassName }: HeroSectionProps) {
  const { eyebrow, title, description, cta } = HOME_CONTENT.hero;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8 lg:pb-28 lg:pt-16",
        customClassName,
      )}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="relative z-10 order-last max-w-xl lg:order-first">
          <Image src="/icon.svg" alt="Fira Estudio" width={40} height={40} className="mb-6 h-10 w-10" />
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
          <h1
            className={cn(
              "mb-6 max-w-[15ch] text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl",
              ANIMATIONS.fadeIn,
            )}
          >
            {title}
          </h1>
          <p className="mb-8 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button href="/productos" variant="primary" size="md" className="group">
              {cta.primary}
              <ArrowRight className={cn("h-5 w-5", ANIMATIONS.hoverIcon)} aria-hidden="true" />
            </Button>
            <Button href="/sobre-nosotros" variant="ghost" size="md">
              {cta.secondary}
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Textiles artesanales para usar cada día.
          </p>
        </div>

        <div className="relative order-first mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-sm bg-muted lg:order-last lg:aspect-[5/4]">
          <Image
            src="/images/productos/caminos/camino-magnolia.webp"
            alt="Camino de mesa Magnolia sobre una mesa junto a una ventana"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1023px) 100vw, 56vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
