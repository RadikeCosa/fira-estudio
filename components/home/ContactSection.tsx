import { SPACING } from "@/lib/design/tokens";
import { DecorativeBadge } from "@/components/ui/DecorativeBadge";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ContactSection - CTA para consultas personalizadas
 * 
 * Sección centrada con bordes decorativos que invita a los usuarios
 * a contactarse para consultas sobre productos.
 */

interface ContactSectionProps {
  /**
   * Título de la sección
   */
  title?: string;
  /**
   * Descripción/subtítulo
   */
  description?: string;
  /**
   * Texto del botón CTA
   */
  ctaText?: string;
  /**
   * Custom CSS classes
   */
  className?: string;
}

export function ContactSection({
  title = "¿Tenés alguna consulta?",
  description = "Estamos para ayudarte a encontrar el producto perfecto para tu hogar. Contactanos y te responderemos a la brevedad.",
  ctaText = "Contactanos por WhatsApp",
  className,
}: ContactSectionProps) {
  return (
    <section
      className={cn(
        "mx-auto max-w-4xl text-center",
        SPACING.sectionPadding.sm,
        className,
      )}
    >
      {/* Decorative Badge */}
      <div className="mb-8 flex justify-center">
        <DecorativeBadge />
      </div>

      {/* Content */}
      <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>

      {/* CTA Button */}
      <Button href="/contacto" variant="primary" size="md" className="group">
        {ctaText}
        <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:scale-110" />
      </Button>

      {/* Decorative Border Lines */}
      <div className="mt-12 flex items-center justify-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
        <div className="h-1.5 w-1.5 rounded-full bg-border" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
      </div>
    </section>
  );
}
