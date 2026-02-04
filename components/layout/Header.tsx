import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { COMPONENTS, COLORS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { CartIndicator } from "./CartIndicator";

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
    <>
      <nav className={cn(COMPONENTS.header.base, COLORS.border)}>
        <div className={COMPONENTS.header.container}>
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <h1 className={COMPONENTS.header.logo}>
              <span className="font-sugo-display text-[1.2em] sm:text-[1.4em] lg:text-[1.6em]">
                fira
              </span>{" "}
              <span className="font-open-sans">estudio</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className={COMPONENTS.header.nav}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={COMPONENTS.header.navLink}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart Indicator & Mobile Navigation */}
          <div className="flex items-center gap-2">
            <CartIndicator />

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
    </>
  );
}
