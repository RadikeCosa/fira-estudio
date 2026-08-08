import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { COMPONENTS } from "@/lib/design/tokens";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      required,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, helperId, errorId]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {required && (
              <span className={cn("ml-1", COMPONENTS.error.label)}>*</span>
            )}
          </label>
        )}

        <input
          {...props}
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            COMPONENTS.input.base,
            COMPONENTS.input.placeholder,
            COMPONENTS.input.focus,
            COMPONENTS.input.hover,
            error &&
              cn(
                COMPONENTS.error.border,
                COMPONENTS.error.focus,
                COMPONENTS.error.ring,
              ),
            className,
          )}
        />

        {helperText && (
          <p id={helperId} className="mt-2 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className={cn("mt-2 text-sm", COMPONENTS.error.message)}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
