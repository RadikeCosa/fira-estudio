import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants/navigation";
import { SITE_CONFIG } from "@/lib/constants"; // ← Importar

const footerLinks = NAV_LINKS.filter((link) => link.href !== "/");

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-foreground text-sm py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4 items-center sm:flex-row sm:justify-between sm:gap-0">
        {/* Marca y tagline */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-medium">{SITE_CONFIG.name}</span>{" "}
          {/* ← Usar constante */}
          <span className="text-xs text-accent mt-1">
            {SITE_CONFIG.tagline} {/* ← Usar constante */}
          </span>
        </div>

        {/* Enlaces principales */}
        <nav className="flex gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Redes sociales + copyright */}
        <div className="flex items-center gap-3">
          <Link
            href={SOCIAL_LINKS.instagram.href}
            aria-label={SOCIAL_LINKS.instagram.ariaLabel}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </Link>
          <Link
            href={SOCIAL_LINKS.email.href}
            aria-label={SOCIAL_LINKS.email.ariaLabel}
            className="hover:text-accent transition-colors"
          >
            <Mail className="h-4 w-4" />
          </Link>
          <span className="ml-2 text-xs text-accent/70">
            © {year} {SITE_CONFIG.name} {/* ← Usar constante */}
          </span>
        </div>
      </div>
    </footer>
  );
}
