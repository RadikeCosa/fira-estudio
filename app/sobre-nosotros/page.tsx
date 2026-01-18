import { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { AboutSection } from "@/components/sobre-nosotros/AboutSection";
import { ValuesGrid } from "@/components/sobre-nosotros/ValuesGrid";
import { ABOUT_CONTENT } from "@/lib/content/sobre-nosotros";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: `Conocé la historia de ${SITE_CONFIG.name}, nuestro proceso artesanal y los valores que nos inspiran.`,
};

export default function SobreNosotrosPage() {
  const { page, image, sections } = ABOUT_CONTENT;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <PageHeader title={page.title} description={page.subtitle} />

      {/* Workshop image */}
      <div className="mb-24 overflow-hidden rounded-3xl border-2 border-border/50 shadow-2xl transition-all duration-300 hover:shadow-3xl">
        <Image
          src={image.src}
          alt={image.alt}
          width={1200}
          height={600}
          className="h-auto w-full object-cover transition-transform duration-700 hover:scale-105"
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
