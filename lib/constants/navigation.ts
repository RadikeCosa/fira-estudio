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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXAMPLE_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
]);

function getPublicValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getPublicContactEmail(
  value: string | undefined = process.env.NEXT_PUBLIC_CONTACT_EMAIL,
): string | undefined {
  const email = getPublicValue(value);
  if (!email || !EMAIL_PATTERN.test(email)) return undefined;

  const domain = email.split("@").at(1)?.toLowerCase();
  if (!domain || EXAMPLE_EMAIL_DOMAINS.has(domain)) return undefined;

  return email;
}

function getPublicHttpUrl(value: string | undefined): string | undefined {
  const url = getPublicValue(value);
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

export const PUBLIC_CONTACT_CHANNELS = {
  get emailAddress() {
    return getPublicContactEmail();
  },
  get instagramUrl() {
    return getPublicHttpUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL);
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
