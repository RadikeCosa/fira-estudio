import { Instagram, Mail, MessageCircle } from "lucide-react";
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

type ContactChannel = "whatsapp" | "email" | "instagram";

interface ContactAction {
  channel: ContactChannel;
  href: string;
  label: string;
  ariaLabel?: string;
  external?: boolean;
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
  const emailAddress = PUBLIC_CONTACT_CHANNELS.emailAddress;
  const emailUrl = emailAddress ? SOCIAL_LINKS.email.href : undefined;
  const instagramUrl = SOCIAL_LINKS.instagram.href;
  const actions: ContactAction[] = [
    ...(whatsappUrl
      ? [
          {
            channel: "whatsapp" as const,
            href: whatsappUrl,
            label: info.cta.whatsapp,
            external: true,
          },
        ]
      : []),
    ...(emailUrl && emailAddress
      ? [
          {
            channel: "email" as const,
            href: emailUrl,
            label: emailAddress,
          },
        ]
      : []),
    ...(instagramUrl
      ? [
          {
            channel: "instagram" as const,
            href: instagramUrl,
            label: info.cta.instagram,
            external: true,
          },
        ]
      : []),
  ];
  const [primaryAction, ...secondaryActions] = actions;

  const renderIcon = (channel: ContactChannel, className = "h-5 w-5") => {
    switch (channel) {
      case "email":
        return <Mail className={className} aria-hidden="true" />;
      case "instagram":
        return <Instagram className={className} aria-hidden="true" />;
      case "whatsapp":
        return <MessageCircle className={className} aria-hidden="true" />;
    }
  };

  return (
    <section aria-label="Opciones de contacto" className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center text-center">
        {initialContext && (
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            <span className="text-foreground">{info.contextLabel}:</span>{" "}
            {formatContext(initialContext)}
          </p>
        )}

        {primaryAction ? (
          <div
            className={cn(
              "flex w-full flex-col items-center",
              initialContext ? "mt-8" : "mt-2",
            )}
          >
            <a
              href={primaryAction.href}
              target={primaryAction.external ? "_blank" : undefined}
              rel={primaryAction.external ? "noopener noreferrer" : undefined}
              aria-label={
                primaryAction.channel === "email"
                  ? `${info.cta.email} a ${primaryAction.label}`
                  : primaryAction.ariaLabel
              }
              className={cn(
                "inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl",
                "bg-foreground px-8 py-4 text-base font-semibold text-background shadow-lg",
                "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
                "sm:w-auto",
              )}
            >
              {renderIcon(primaryAction.channel)}
              <span>{primaryAction.label}</span>
            </a>

            {secondaryActions.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                {secondaryActions.map((action, index) => (
                  <span
                    key={action.channel}
                    className="inline-flex items-center gap-x-3"
                  >
                    {index > 0 && <span aria-hidden="true">·</span>}
                    <a
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      rel={
                        action.external ? "noopener noreferrer" : undefined
                      }
                      aria-label={action.ariaLabel}
                      className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-4"
                    >
                      {action.channel === "email" && emailAddress
                        ? emailAddress
                        : info.items.instagram.label}
                    </a>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p role="status" className="mt-4 text-muted-foreground">
            {info.emptyState}
          </p>
        )}
      </div>
    </section>
  );
}
