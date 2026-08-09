import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";
import {
  PUBLIC_CONTACT_CHANNELS,
  SOCIAL_LINKS,
} from "@/lib/constants/navigation";
import {
  buildGeneralInquiryMessage,
  buildProductInquiryMessageFromParts,
  buildWhatsappUrl,
} from "@/lib/contact/whatsapp";
import { cn } from "@/lib/utils";

export interface ContactProductContext {
  producto: string;
  variante?: string;
}

interface ContactInfoProps {
  initialContext?: ContactProductContext;
}

function buildContactMessage(context?: ContactProductContext): string {
  if (!context) return buildGeneralInquiryMessage();

  return buildProductInquiryMessageFromParts(context.producto, context.variante);
}

function formatContext(context: ContactProductContext): string {
  return context.variante
    ? `${context.producto} · ${context.variante}`
    : context.producto;
}

export function ContactInfo({ initialContext }: ContactInfoProps) {
  const { info } = CONTACTO_CONTENT;
  const whatsappUrl = buildWhatsappUrl(buildContactMessage(initialContext));
  const emailUrl = SOCIAL_LINKS.email.href;
  const instagramUrl = SOCIAL_LINKS.instagram.href;
  const hasAnyChannel = Boolean(whatsappUrl || emailUrl || instagramUrl);

  return (
    <section aria-labelledby="contact-channels-title">
      <Card hover={false} className="mx-auto max-w-3xl">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2
              id="contact-channels-title"
              className="text-2xl font-bold text-foreground"
            >
              {info.title}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {info.intro}
            </p>
          </div>

          {initialContext && (
            <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {info.contextLabel}:
              </span>{" "}
              {formatContext(initialContext)}
            </p>
          )}

          {whatsappUrl && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-50 p-3 text-green-700">
                  <MessageCircle className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {info.whatsapp.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {info.whatsapp.description}
                  </p>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex w-full items-center justify-center gap-3 rounded-xl",
                  "bg-foreground px-8 py-4 text-base font-semibold text-background shadow-lg",
                  "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                  "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
                  "sm:w-auto",
                )}
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>{info.whatsapp.cta}</span>
              </a>
            </div>
          )}

          {(emailUrl || instagramUrl) && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                {info.secondaryTitle}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
                  >
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                    <span>{info.items.instagram.label}</span>
                  </a>
                )}

                {emailUrl && PUBLIC_CONTACT_CHANNELS.emailAddress && (
                  <a
                    href={emailUrl}
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
                  >
                    <Mail className="h-5 w-5" aria-hidden="true" />
                    <span>{PUBLIC_CONTACT_CHANNELS.emailAddress}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {!hasAnyChannel && (
            <p role="status" className="text-muted-foreground">
              {info.emptyState}
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
