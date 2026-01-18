import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background shadow-lg hover:shadow-xl hover:scale-[1.02] focus:ring-foreground",
        secondary:
          "border-2 border-border bg-white/50 backdrop-blur-sm text-foreground shadow-sm hover:bg-white hover:border-foreground/20 hover:shadow-md focus:ring-foreground",
        ghost: "text-foreground hover:bg-muted/50",
      },
      size: {
        sm: "px-6 py-2.5 text-sm",
        md: "px-8 py-4 text-base sm:px-10 sm:py-4 sm:text-lg",
        lg: "px-10 py-5 text-lg sm:px-12 sm:py-5 sm:text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, href, children, ...props }, ref) => {
    if (href) {
      return (
        <Link
          href={href}
          className={buttonVariants({ variant, size, className })}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
