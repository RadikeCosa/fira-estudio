import { HOME_CONTENT } from "@/lib/content/home";
import { SPACING, ANIMATIONS, BLOBS } from "@/lib/design/tokens";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  customClassName?: string;
}

export function HeroSection({ customClassName }: HeroSectionProps) {
  const { subtitle, description, cta } = HOME_CONTENT.hero;

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        SPACING.sectionPadding.md,
        "bg-gradient-to-b from-muted/50 via-background to-background",
        customClassName,
      )}
    >
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className={BLOBS.heroTop} />
        <div className={BLOBS.heroBottom} />
      </div>

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <h1
          className={cn(
            "mb-6 text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70 sm:text-6xl lg:text-7xl",
            ANIMATIONS.fadeIn,
          )}
        >
          <span className="font-sugo-display text-[1.2em] sm:text-[1.4em] lg:text-[1.6em]">
            fira
          </span>{" "}
          <span className="font-open-sans">estudio</span>
        </h1>
        <p
          className={cn(
            "mb-5 text-xl font-medium text-foreground/80 sm:text-2xl",
            ANIMATIONS.fadeInDelayed,
          )}
        >
          {subtitle}
        </p>
        <p
          className={cn(
            "mx-auto mb-12 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg",
            ANIMATIONS.fadeInDelayed,
            "delay-300",
          )}
        >
          {description}
        </p>
        <div
          className={cn(
            "flex flex-col gap-4 sm:flex-row sm:justify-center",
            ANIMATIONS.fadeInDelayed,
            "delay-500",
          )}
        >
          <Button
            href="/productos"
            variant="primary"
            size="md"
            className="group"
          >
            {cta.primary}
            <ArrowRight className={cn("h-5 w-5", ANIMATIONS.hoverIcon)} />
          </Button>
          <Button href="/sobre-nosotros" variant="secondary" size="md">
            {cta.secondary}
          </Button>
        </div>
      </div>
    </section>
  );
}
