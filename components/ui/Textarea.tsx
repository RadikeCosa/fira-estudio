import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { COMPONENTS } from "@/lib/design/tokens";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
    const textareaId = props.id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, helperId, errorId]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {required && (
              <span className={cn("ml-1", COMPONENTS.error.label)}>*</span>
            )}
          </label>
        )}

        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            COMPONENTS.input.base,
            COMPONENTS.input.placeholder,
            COMPONENTS.input.focus,
            COMPONENTS.input.hover,
            "resize-none",
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

Textarea.displayName = "Textarea";
