import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { TYPOGRAPHY, COLORS } from "@/lib/design/tokens";
import type { AboutParagraph } from "@/lib/content/sobre-nosotros";

interface AboutSectionProps {
  title: string;
  icon: LucideIcon;
  paragraphs: AboutParagraph[];
}

/**
 * Reusable section component for About page
 * Displays an icon, title, and multiple paragraphs
 * Used for historia and proceso sections
 */
export function AboutSection({ title, paragraphs }: AboutSectionProps) {
  return (
    <section>
      <div className="mb-10 flex items-center gap-4">
        <h2 className={`${TYPOGRAPHY.heading.section} ${COLORS.foreground}`}>
          {title}
        </h2>
      </div>

      <div className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={`${TYPOGRAPHY.body.muted} sm:text-lg`}>
            {typeof paragraph === "string" ? (
              paragraph
            ) : (
              <>
                {paragraph.before}
                <Link
                  href={paragraph.link.href}
                  className="font-medium text-foreground underline-offset-4 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-4"
                >
                  {paragraph.link.text}
                </Link>
                {paragraph.after}
              </>
            )}
          </p>
        ))}
      </div>
    </section>
  );
}
