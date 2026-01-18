export function DecorativeBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`mb-4 inline-block ${className}`}>
      <div className="inline-flex h-1 w-16 rounded-full bg-gradient-to-r from-foreground/20 via-foreground to-foreground/20" />
    </div>
  );
}
