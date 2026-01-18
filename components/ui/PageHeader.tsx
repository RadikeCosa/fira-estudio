import { DecorativeBadge } from "./DecorativeBadge";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, LAYOUT } from "@/lib/design/tokens";

// Props del componente PageHeader reutilizable
interface PageHeaderProps {
  title: string; // Título de la página (requerido)
  description?: string; // Descripción opcional
  showBadge?: boolean; // Si muestra el badge decorativo (default true)
  className?: string; // Para customización adicional del contenedor
}

/**
 * Componente PageHeader para unificar encabezados de página
 * Español argentino para comentarios y nomenclatura
 */
export function PageHeader({
  title,
  description,
  showBadge = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      {/* Badge decorativo condicional */}
      {showBadge && <DecorativeBadge />}
      {/* Título principal con estilos de DT */}
      <h1 className={cn(TYPOGRAPHY.heading.page, "mb-5 text-foreground")}>
        {title}
      </h1>
      {/* Descripción opcional con estilos de DT */}
      {description && (
        <p className={cn(LAYOUT.container.maxW2xl, TYPOGRAPHY.body.muted)}>
          {description}
        </p>
      )}
    </div>
  );
}
