import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { COMPONENTS, COLORS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * Footer - Pie de página con diseño boutique
 * 
 * Features:
 * - Logo centrado con subtitle decorativo
 * - Grid de links de navegación
 * - Iconos sociales
 * - Copyright con tracking ultra-wide
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(COMPONENTS.footer.base, COMPONENTS.footer.container, COLORS.border)}>
      {/* Logo & Subtitle */}
      <div className="mb-10">
        <h2 className={COMPONENTS.footer.logo}>{SITE_CONFIG.name}</h2>
        <p className={COMPONENTS.footer.subtitle}>
          Creaciones Textiles y Digitales
        </p>
      </div>

      {/* Navigation Links */}
      <nav className={COMPONENTS.footer.nav} aria-label="Enlaces principales">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={COMPONENTS.footer.navLink}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Social Links */}
      <div className={COMPONENTS.footer.socialLinks} aria-label="Redes sociales">
        {/* Instagram */}
        <a
          href="https://instagram.com/mumaestudio"
          target="_blank"
          rel="noopener noreferrer"
          className={COMPONENTS.footer.socialIcon}
          aria-label="Instagram de Muma Estudio"
        >
          <Instagram className="w-6 h-6" aria-hidden="true" />
        </a>

        {/* Email */}
        <a
          href={`mailto:${SITE_CONFIG.email}`}
          className={COMPONENTS.footer.socialIcon}
          aria-label="Enviar email a Muma Estudio"
        >
          <Mail className="w-6 h-6" aria-hidden="true" />
        </a>
      </div>

      {/* Copyright */}
      <p className={COMPONENTS.footer.copyright}>
        © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
