import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants/navigation";
import { SITE_CONFIG } from "@/lib/constants"; // ← Importar

const footerLinks = NAV_LINKS.filter((link) => link.href !== "/");

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-white to-muted/30 text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-6 items-center sm:flex-row sm:justify-between sm:gap-0">
        {/* Marca y tagline */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-bold text-lg">{SITE_CONFIG.name}</span>
          <span className="text-xs text-muted-foreground mt-1.5">
            {SITE_CONFIG.tagline}
          </span>
        </div>

        {/* Enlaces principales */}
        <nav className="flex gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                text-sm font-medium
                text-muted-foreground
                hover:text-foreground
                transition-colors
                duration-300
              "
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Redes sociales + copyright */}
        <div className="flex items-center gap-4">
          <Link
            href={SOCIAL_LINKS.instagram.href}
            aria-label={SOCIAL_LINKS.instagram.ariaLabel}
            target="_blank"
            rel="noopener noreferrer"
            className="
              p-2 rounded-lg
              text-muted-foreground
              hover:text-foreground
              hover:bg-muted/50
              transition-all
              duration-300
            "
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            href={SOCIAL_LINKS.email.href}
            aria-label={SOCIAL_LINKS.email.ariaLabel}
            className="
              p-2 rounded-lg
              text-muted-foreground
              hover:text-foreground
              hover:bg-muted/50
              transition-all
              duration-300
            "
          >
            <Mail className="h-5 w-5" />
          </Link>
          <span className="ml-2 text-xs text-muted-foreground/80">
            © {year} {SITE_CONFIG.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
