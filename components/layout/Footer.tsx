import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants/navigation";
import { COMPONENTS, COLORS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";
/**
 * Footer - Pie de página 100% configurable
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  // Mapeo de íconos para redes sociales
  const getIcon = (key: string): React.ReactNode => {
    switch (key) {
      case "instagram":
        return <Instagram className="w-6 h-6" aria-hidden="true" />;
      case "email":
        return <Mail className="w-6 h-6" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <footer className={cn(COMPONENTS.footer.base, COLORS.border)}>
      <div className={COMPONENTS.footer.container}>
        <div className={COMPONENTS.footer.innerWrapper}>
          {/* Logo y subtítulo desde SITE_CONFIG */}
          <div className={COMPONENTS.footer.brandSection}>
            <h2 className={COMPONENTS.footer.logo}>{SITE_CONFIG.name}</h2>
            <p className={COMPONENTS.footer.subtitle}>
              {SITE_CONFIG.footerSubtitle}
            </p>
          </div>

          {/* Enlaces de navegación desde NAV_LINKS */}
          <div className={COMPONENTS.footer.navSection}>
            <nav
              className={COMPONENTS.footer.nav}
              aria-label="Enlaces principales"
            >
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
          </div>

          {/* Redes sociales y copyright */}
          <div className={COMPONENTS.footer.socialSection}>
            {/* Íconos y enlaces sociales desde SOCIAL_LINKS */}
            <div
              className={COMPONENTS.footer.socialLinks}
              aria-label="Redes sociales"
            >
              {Object.entries(SOCIAL_LINKS).map(([key, social]) => (
                <a
                  key={key}
                  href={social.href}
                  target={
                    social.href && social.href.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    social.href && social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={COMPONENTS.footer.socialIcon}
                  aria-label={social.ariaLabel}
                >
                  {getIcon(key)}
                </a>
              ))}
            </div>

            {/* Copyright dinámico y sin hardcodeo */}
            <p className={COMPONENTS.footer.copyright}>
              © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
