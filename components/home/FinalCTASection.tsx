import { HOME_CONTENT } from "@/lib/content/home";
import { SPACING } from "@/lib/design/tokens";

import { ArrowRight, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildGeneralInquiryMessage } from "@/lib/contact/whatsapp";
import { WHATSAPP } from "@/lib/constants";
import { PUBLIC_CONTACT_CHANNELS, SOCIAL_LINKS } from "@/lib/constants/navigation";

export function FinalCTASection() {
  const { title, description, ctaText } = HOME_CONTENT.finalCta;
  const whatsappUrl = WHATSAPP.getUrl(buildGeneralInquiryMessage());
  const email = PUBLIC_CONTACT_CHANNELS.emailAddress;
  const instagram = SOCIAL_LINKS.instagram.href;

  return (
    <section
      className={cn("mx-auto max-w-4xl text-center", SPACING.sectionPadding.sm)}
    >
      <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {ctaText}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground" role="status">
            Las consultas por WhatsApp no están disponibles ahora.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-sm font-medium">
            {email && (
              <a className="inline-flex min-h-11 items-center gap-2 text-accent hover:underline" href={`mailto:${email}`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Consultar por email
              </a>
            )}
            {instagram && (
              <a className="inline-flex min-h-11 items-center gap-2 text-accent hover:underline" href={instagram} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" aria-hidden="true" />
                Consultar por Instagram
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
