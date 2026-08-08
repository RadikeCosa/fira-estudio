import {
  buildGeneralInquiryMessage,
  buildWhatsappUrl,
  getWhatsappNumber,
} from "@/lib/contact/whatsapp";

/**
 * Navigation constants for the application
 * Centralized navigation links and social media links
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href?: string;
  ariaLabel: string;
}

function getPublicValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const PUBLIC_CONTACT_CHANNELS = {
  get emailAddress() {
    return getPublicValue(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
  },
  get instagramUrl() {
    return getPublicValue(process.env.NEXT_PUBLIC_INSTAGRAM_URL);
  },
  get whatsappNumber() {
    return getWhatsappNumber();
  },
} as const;

/**
 * Main navigation links displayed in Header and Footer
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Nosotros", href: "/sobre-nosotros" },
  { label: "Contacto", href: "/contacto" },
];

/**
 * Social media and contact links
 * Uses environment variables for URLs to allow easy configuration
 */
export const SOCIAL_LINKS = {
  get whatsapp() {
    return {
      label: "WhatsApp",
      href: buildWhatsappUrl(buildGeneralInquiryMessage()) ?? undefined,
      ariaLabel: "WhatsApp",
    };
  },
  get instagram() {
    return {
      label: "Instagram",
      href: PUBLIC_CONTACT_CHANNELS.instagramUrl,
      ariaLabel: "Instagram",
    };
  },
  get email() {
    return {
      label: "Email",
      href: PUBLIC_CONTACT_CHANNELS.emailAddress
        ? `mailto:${PUBLIC_CONTACT_CHANNELS.emailAddress}`
        : undefined,
      ariaLabel: "Email",
    };
  },
} as const;
