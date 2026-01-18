import { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";
import type { ReactNode } from "react";

// Props del componente ContactInfoItem
interface ContactInfoItemProps {
  icon: LucideIcon; // Componente de ícono de lucide-react
  title: string; // Título del item (ej: "Email")
  content: ReactNode; // Contenido (string o JSX)
  href?: string; // URL opcional para link
  external?: boolean; // Si el link es externo (default false)
}

/**
 * Componente ContactInfoItem para unificar ítems de información de contacto
 * Español argentino para comentarios y nomenclatura
 */
export function ContactInfoItem({
  icon,
  title,
  content,
  href,
  external = false,
}: ContactInfoItemProps) {
  // Determinar el wrapper: <a> si hay href, <div> si no
  const ContentWrapper = href ? "a" : "div";

  // Props condicionales para el link
  const linkProps = href
    ? {
        href,
        ...(external && { target: "_blank", rel: "noopener noreferrer" }),
        className:
          "text-muted-foreground hover:text-foreground transition-colors duration-300",
      }
    : {
        className: "text-muted-foreground",
      };

  return (
    <div className="flex items-start gap-4">
      {/* Ícono usando el componente Icon wrapper */}
      <Icon icon={icon} size="md" animated />
      <div>
        {/* Título del item */}
        <h3 className="mb-2 font-bold text-foreground">{title}</h3>
        {/* Contenido, envuelto en <a> si hay href */}
        <ContentWrapper {...linkProps}>{content}</ContentWrapper>
      </div>
    </div>
  );
}
