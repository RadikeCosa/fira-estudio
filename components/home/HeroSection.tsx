import { HOME_CONTENT } from "@/lib/content/home";
import { SPACING, ANIMATIONS, COMPONENTS } from "@/lib/design/tokens";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  customClassName?: string;
}

function HeroBadge() {
  return (
    <div
      className={cn(
        COMPONENTS.heroBadge.base,
        ANIMATIONS.shimmer,
        ANIMATIONS.fadeIn,
      )}
    >
      <Sparkles className="h-4 w-4 text-foreground" />
      <span>{HOME_CONTENT.hero.badge}</span>
    </div>
  );
}

export function HeroSection({ customClassName }: HeroSectionProps) {
  const { title, subtitle, description, cta } = HOME_CONTENT.hero;

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
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-muted to-transparent opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-muted to-transparent opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <HeroBadge />
        <h1
          className={cn(
            "mb-6 text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70 sm:text-6xl lg:text-7xl",
            ANIMATIONS.fadeIn,
          )}
        >
          {title}
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
