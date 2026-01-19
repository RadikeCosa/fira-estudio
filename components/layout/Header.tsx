"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { COMPONENTS, COLORS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

/**
 * Header - Navegación principal con diseño minimalista
 * 
 * Features:
 * - Fixed top con backdrop blur
 * - Logo centrado (Playfair Display)
 * - Menú hamburguesa en mobile
 * - Transición suave en scroll
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className={cn(COMPONENTS.header.base, COLORS.border)}>
        <div className={COMPONENTS.header.container}>
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <h1 className={COMPONENTS.header.logo}>
              {SITE_CONFIG.name}
            </h1>
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={COMPONENTS.header.menuButton}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className={COMPONENTS.mobileNav.overlay}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          COMPONENTS.mobileNav.menu,
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Close Button */}
        <div className="flex justify-end p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className={COMPONENTS.mobileNav.closeButton}
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Links */}
        <nav className="px-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "block py-4 text-base font-medium transition-colors",
                COLORS.border,
                "border-b last:border-0"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Decorative text at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] text-center">
            Creaciones Textiles
          </p>
        </div>
      </div>
    </>
  );
}
