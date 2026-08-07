import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { COMPONENTS, COLORS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";
import { ActiveNavLinks } from "./ActiveNavLinks";
import { MobileNav } from "./MobileNav";

/**
 * Header - Navegación principal con diseño minimalista
 *
 * Features:
 * - Fixed top con backdrop blur
 * - Logo centrado en mobile, alineado a la izquierda en desktop
 * - Menú hamburguesa en mobile
 * - Navegación horizontal en desktop (md: 768px+)
 * - Transición suave en scroll
 */
export function Header() {
  return (
    <header className={cn(COMPONENTS.header.base, COLORS.border)}>
      <nav aria-label="Navegación principal">
        <div className={COMPONENTS.header.container}>
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <span className={COMPONENTS.header.logo}>
              <span className="font-sugo-display text-[1.2em] sm:text-[1.4em] lg:text-[1.6em]">
                fira
              </span>{" "}
              <span className="font-open-sans">estudio</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className={COMPONENTS.header.nav}>
            <ActiveNavLinks links={NAV_LINKS} />
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <MobileNav
                links={NAV_LINKS}
                logo={SITE_CONFIG.name}
                decorativeText="Creaciones Textiles"
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
