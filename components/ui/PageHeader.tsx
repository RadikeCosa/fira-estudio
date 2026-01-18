import { DecorativeBadge } from "./DecorativeBadge";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY, LAYOUT } from "@/lib/design/tokens";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBadge?: boolean;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  showBadge = true,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      {showBadge && <DecorativeBadge />}
      
      <h1 className={cn(TYPOGRAPHY.heading.page, "mb-5 text-foreground")}>
        {title}
      </h1>
      
      {description && (
        <p className={cn(LAYOUT.container.maxW2xl, "text-base leading-relaxed text-muted-foreground sm:text-lg")}>
          {description}
        </p>
      )}
    </div>
  );
}
