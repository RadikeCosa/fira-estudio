import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface DecorativeBadgeProps {
  children?: React.ReactNode;
  variant?: "outline" | "filled";
  className?: string;
}

/**
 * DecorativeBadge - Badges estilo boutique
 * 
 * Variantes:
 * - outline: Borde con texto del color primario
 * - filled: Fondo primario con texto blanco
 * 
 * Si no se proporciona children, muestra una línea decorativa (retrocompatibilidad)
 * 
 * Uso:
 * <DecorativeBadge variant="outline">Pieza Única</DecorativeBadge>
 * <DecorativeBadge /> // Solo línea decorativa
 */
export function DecorativeBadge({
  children,
  variant = "outline",
  className = "",
}: DecorativeBadgeProps) {
  // Backward compatibility: if no children, show decorative line
  if (!children) {
    return (
      <div className={cn("mb-4 inline-block", className)}>
        <div className="inline-flex h-1 w-16 rounded-full bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20" />
      </div>
    );
  }

  return (
    <span
      className={cn(
        COMPONENTS.badge[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
