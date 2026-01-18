import { cn } from "@/lib/utils";
import { COMPONENTS as DT } from "@/lib/design/tokens";
import type { ReactNode } from "react";

// Props del componente Card genérico
interface CardProps {
  children: ReactNode;
  hover?: boolean; // Si aplica efecto hover
  padding?: "none" | "sm" | "md" | "lg"; // Nivel de padding interno
  className?: string; // Para customización adicional
}

// Clases de padding según nivel
const paddingClasses = {
  none: "",
  sm: "p-6",
  md: "p-8 sm:p-10",
  lg: "p-10 sm:p-12",
};

/**
 * Componente Card reutilizable para unificar estilos de tarjetas
 * Español argentino para comentarios y nomenclatura
 */
export function Card({
  children,
  hover = false,
  padding = "md",
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        DT.card.base,
        paddingClasses[padding],
        hover && DT.card.hover,
        className,
      )}
    >
      {children}
    </div>
  );
}
