import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { COMPONENTS } from "@/lib/design/tokens";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, required, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={props.id}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {required && (
              <span className={cn("ml-1", COMPONENTS.error.label)}>*</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          required={required}
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
          {...props}
        />

        {error && (
          <p className={cn("mt-2 text-sm", COMPONENTS.error.message)}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
