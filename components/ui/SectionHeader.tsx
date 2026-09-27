import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  titleId?: string;
}

export function SectionHeader({
  title,
  description,
  className = "",
  titleId,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 max-w-3xl text-left sm:mb-14", className)}>
      <h2 id={titleId} className="mb-4 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
