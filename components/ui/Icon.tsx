import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPONENTS as DT } from "@/lib/design/tokens";

// Props del componente Icon wrapper
interface IconProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
  animated?: boolean;
  className?: string;
}

// Clases de tamaño para el contenedor
const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-14 w-14",
  lg: "h-16 w-16",
};

// Clases de tamaño para el ícono interno
const iconSizes = {
  sm: "h-5 w-5",
  md: "h-6 w-6 sm:h-7 sm:w-7",
  lg: "h-8 w-8",
};

/**
 * Icon wrapper reutilizable para unificar estilos de íconos en el proyecto
 * Español argentino para comentarios y nomenclatura
 */
export function Icon({
  icon: IconComponent,
  size = "md",
  variant = "default",
  animated = true,
  className,
}: IconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        sizeClasses[size],
        variant === "default" && [
          DT.iconContainer.base,
          animated && DT.iconContainer.hover,
        ],
        className,
      )}
    >
      {/* Renderiza el ícono recibido como componente React, con el tamaño adecuado */}
      <IconComponent className={iconSizes[size]} />
    </div>
  );
}
