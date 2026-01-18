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
            {required && <span className="ml-1 text-red-600">*</span>}
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
            error && "border-red-600 focus:border-red-600 focus:ring-red-600/10",
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
