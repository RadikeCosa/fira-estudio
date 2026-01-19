import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90",
        secondary: "border border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100",
        accent: "bg-primary text-white hover:bg-opacity-90",
        ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
      },
      size: {
        sm: "px-6 py-2.5 text-xs",
        md: "px-8 py-4 text-sm",
        lg: "px-12 py-5 text-base",
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
  href?: string;
  external?: boolean;
}

export function Button({
  className,
  variant,
  size,
  href,
  external = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
