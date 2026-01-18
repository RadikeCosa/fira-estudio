import { cn } from "@/lib/utils";
import { COMPONENTS } from "@/lib/design/tokens";

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

const paddingClasses = {
  none: "",
  sm: COMPONENTS.card.paddingSm,
  md: COMPONENTS.card.paddingMd,
  lg: COMPONENTS.card.paddingLg,
};

export function Card({ 
  children, 
  hover = false, 
  padding = "md", 
  className 
}: CardProps) {
  return (
    <div
      className={cn(
        COMPONENTS.card.base,
        paddingClasses[padding],
        hover && COMPONENTS.card.hover,
        className
      )}
    >
      {children}
    </div>
  );
}
