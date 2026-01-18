import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPONENTS } from "@/lib/design/tokens";

interface IconProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-14 w-14",
  lg: "h-16 w-16",
};

const iconSizes = {
  sm: "h-5 w-5",
  md: "h-6 w-6 sm:h-7 sm:w-7",
  lg: "h-8 w-8",
};

export function Icon({ 
  icon: IconComponent, 
  size = "md", 
  variant = "default",
  animated = true,
  className 
}: IconProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        sizeClasses[size],
        variant === "default" && [
          COMPONENTS.iconContainer.base,
          animated && COMPONENTS.iconContainer.hover,
        ],
        className
      )}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
}
