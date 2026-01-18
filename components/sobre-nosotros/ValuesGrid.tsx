import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ABOUT_CONTENT } from "@/lib/content/sobre-nosotros";

/**
 * Values grid component for About page
 * Displays a grid of value cards with icons from ABOUT_CONTENT
 * Server Component - no client-side interactivity needed
 */
export function ValuesGrid() {
  const { valores } = ABOUT_CONTENT.sections;

  return (
    <section>
      <SectionHeader title={valores.title} description={valores.description} />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
        {valores.items.map((value, index) => (
          <Card key={index} hover className="group">
            <Icon icon={value.icon} size="md" animated className="mb-6" />
            
            <h3 className="mb-4 text-xl font-bold text-foreground">
              {value.title}
            </h3>
            
            <p className="text-base leading-relaxed text-muted-foreground">
              {value.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
