import { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";

interface ContactInfoItemProps {
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
  href?: string;
  external?: boolean;
}

export function ContactInfoItem({ 
  icon, 
  title, 
  content, 
  href,
  external = false 
}: ContactInfoItemProps) {
  const ContentWrapper = href ? "a" : "div";
  
  const linkProps = href ? {
    href,
    ...(external && { target: "_blank", rel: "noopener noreferrer" }),
    className: "text-muted-foreground hover:text-foreground transition-colors duration-300"
  } : {
    className: "text-muted-foreground"
  };

  return (
    <div className="flex items-start gap-4">
      <Icon icon={icon} size="md" animated />
      
      <div>
        <h3 className="mb-2 font-bold text-foreground">{title}</h3>
        <ContentWrapper {...linkProps}>
          {content}
        </ContentWrapper>
      </div>
    </div>
  );
}
