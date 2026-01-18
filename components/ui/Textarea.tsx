import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { COMPONENTS as DT } from "@/lib/design/tokens";

// Props del componente Textarea, extendiendo los atributos nativos de textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // Texto del label
  error?: string; // Mensaje de error
  helperText?: string; // Texto de ayuda (solo si no hay error)
}

/**
 * Componente Textarea reutilizable y accesible
 * Centraliza estilos y lógica de label, error y helperText
 * Español argentino para comentarios y nomenclatura
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, required, id, ...props }, ref) => {
    // El id conecta el label con el textarea
    const textareaId = id;

    // Estilos base del textarea desde design tokens (reutiliza los de input)
    const textareaBase = DT.input.base;
    const textareaPlaceholder = DT.input.placeholder;
    const textareaFocus = DT.input.focus;
    const textareaHover = DT.input.hover;
    // Si hay error, sobrescribir estilos de borde y focus
    const errorStyles = error
      ? "border-red-600 focus:border-red-600 focus:ring-red-600/10"
      : "";

    return (
      <div>
        {/* Label condicional, conectado por htmlFor al textarea */}
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        {/* Textarea principal */}
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          className={cn(
            textareaBase,
            textareaPlaceholder,
            textareaFocus,
            textareaHover,
            "resize-none",
            errorStyles,
            className,
          )}
          {...props}
        />
        {/* Mensaje de error o helperText (mutuamente excluyentes) */}
        {error ? (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
