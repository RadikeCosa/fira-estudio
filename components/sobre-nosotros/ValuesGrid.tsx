import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ABOUT_CONTENT } from "@/lib/content/sobre-nosotros";
import { TYPOGRAPHY, COLORS } from "@/lib/design/tokens";

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {valores.items.map((value, index) => (
          <Card key={index} hover className="group">
            <Icon icon={value.icon} size="md" animated className="mb-6" />
            <h3
              className={`mb-4 ${TYPOGRAPHY.heading.card} ${COLORS.foreground}`}
            >
              {value.title}
            </h3>
            <p className={`${TYPOGRAPHY.body.base} text-muted-foreground`}>
              {value.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
