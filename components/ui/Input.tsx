import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { COMPONENTS as DT } from "@/lib/design/tokens";

// Props del componente Input, extendiendo los atributos nativos de input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Texto del label
  error?: string; // Mensaje de error
  helperText?: string; // Texto de ayuda (solo si no hay error)
}

/**
 * Componente Input reutilizable y accesible
 * Centraliza estilos y lógica de label, error y helperText
 * Español argentino para comentarios y nomenclatura
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, required, id, ...props }, ref) => {
    // Generar id único si no se provee (opcional, aquí asumimos que siempre se pasa id)
    const inputId = id;

    // Estilos base del input desde design tokens
    const inputBase = DT.input.base;
    const inputPlaceholder = DT.input.placeholder;
    const inputFocus = DT.input.focus;
    const inputHover = DT.input.hover;
    // Si hay error, sobrescribir estilos de borde y focus
    const errorStyles = error
      ? "border-red-600 focus:border-red-600 focus:ring-red-600/10"
      : "";

    return (
      <div>
        {/* Label condicional, conectado por htmlFor al input */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}
        {/* Input principal */}
        <input
          id={inputId}
          ref={ref}
          required={required}
          className={cn(
            inputBase,
            inputPlaceholder,
            inputFocus,
            inputHover,
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

Input.displayName = "Input";
