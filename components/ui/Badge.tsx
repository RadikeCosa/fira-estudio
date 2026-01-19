import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

type BadgeVariant = 'success' | 'warning' | 'info' | 'error';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: COMPONENTS.badge.success,
  warning: COMPONENTS.badge.warning,
  info: COMPONENTS.badge.info,
  error: COMPONENTS.badge.error,
};

const dotClasses: Record<BadgeVariant, string> = {
  success: COMPONENTS.badge.dotSuccess,
  warning: COMPONENTS.badge.dotWarning,
  info: COMPONENTS.badge.dotInfo,
  error: COMPONENTS.badge.dotError,
};

export function Badge({ 
  variant, 
  children, 
  showDot = false, 
  className 
}: BadgeProps) {
  return (
    <div
      className={cn(
        COMPONENTS.badge.base,
        variantClasses[variant],
        className
      )}
    >
      {showDot && (
        <div className={cn(COMPONENTS.badge.dot, dotClasses[variant])} />
      )}
      {children}
    </div>
  );
}
