import { Mail, Instagram } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ContactInfoItem } from "@/components/ui/ContactInfoItem";
import { CONTACTO_CONTENT } from "@/lib/content/contacto";
import { SOCIAL_LINKS } from "@/lib/constants/navigation";

export function ContactInfo() {
  const { info, horarios } = CONTACTO_CONTENT;

  return (
    <div className="space-y-6">
      {/* Contact information card */}
      <Card hover={false}>
        <h2 className="mb-8 text-2xl font-bold text-foreground">
          {info.title}
        </h2>

        <div className="space-y-6">
          <ContactInfoItem
            icon={Mail}
            title={info.items.email.title}
            content={SOCIAL_LINKS.email.href.replace("mailto:", "")}
            href={SOCIAL_LINKS.email.href}
          />

          <ContactInfoItem
            icon={Instagram}
            title={info.items.instagram.title}
            content={info.items.instagram.handle}
            href={SOCIAL_LINKS.instagram.href}
            external
          />
        </div>
      </Card>

      {/* Business hours card */}
      <Card hover={false}>
        <h2 className="mb-6 text-2xl font-bold text-foreground">
          {horarios.title}
        </h2>

        <div className="space-y-3 text-muted-foreground">
          {horarios.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  item.active ? "bg-foreground/50" : "bg-foreground/20"
                }`}
              />
              <p>
                {item.label}: {item.hours}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
