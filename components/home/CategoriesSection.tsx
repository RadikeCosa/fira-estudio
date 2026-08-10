import { HOME_CONTENT } from "@/lib/content/home";
import { GRADIENTS, LAYOUT, SPACING } from "@/lib/design/tokens";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
}

function CategoryCard({ title, description, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group shine-effect overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-foreground/10 hover:-translate-y-2",
      )}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/50 to-muted relative">
        {/* Imagen o ícono decorativo opcional aquí */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-foreground/90">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function CategoriesSection() {
  const { title, description, items } = HOME_CONTENT.categories;

  return (
    <section className={cn(GRADIENTS.section, SPACING.sectionPadding.sm)}>
      <div className={LAYOUT.container.maxW7xl}>
        <SectionHeader title={title} description={description} />
        <div className={LAYOUT.grid.categories}>
          {items.map((cat) => (
            <CategoryCard
              key={cat.id}
              title={cat.title}
              description={cat.description}
              href={cat.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
