import { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { AboutSection } from "@/components/sobre-nosotros/AboutSection";
import { ValuesGrid } from "@/components/sobre-nosotros/ValuesGrid";
import { ABOUT_CONTENT } from "@/lib/content/sobre-nosotros";
import { SITE_CONFIG } from "@/lib/constants";
import { LAYOUT, SPACING, COMPONENTS, ANIMATIONS } from "@/lib/design/tokens";

export const metadata: Metadata = buildMetadata({
  title: "Sobre Nosotros",
  description: `Conocé la historia de ${SITE_CONFIG.name}, nuestro proceso artesanal y los valores que nos inspiran.`,
});

export default function SobreNosotrosPage() {
  const { page, image, sections } = ABOUT_CONTENT;

  return (
    <div className={`${LAYOUT.container.maxW5xl} ${SPACING.pageNarrow}`}>
      <PageHeader title={page.title} description={page.subtitle} />

      {/* Workshop image */}
      <div className={`${COMPONENTS.card.base} ${COMPONENTS.card.hover} mb-24 overflow-hidden`}>
        <Image
          src={image.src}
          alt={image.alt}
          width={1200}
          height={600}
          className={`h-auto w-full object-cover ${ANIMATIONS.fadeIn} hover:scale-105`}
          priority
        />
      </div>

      {/* Content sections */}
      <div className="space-y-24">
        <AboutSection {...sections.historia} />
        <AboutSection {...sections.proceso} />
        <ValuesGrid />
      </div>
    </div>
  );
}
