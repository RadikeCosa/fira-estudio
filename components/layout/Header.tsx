"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/constants/navigation";
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
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="px-6 py-4 flex justify-between items-center max-w-lg mx-auto">
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <h1 className="font-display text-xl tracking-widest uppercase font-bold">
              {SITE_CONFIG.name}
            </h1>
          </Link>

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
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
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-background z-50 shadow-2xl transform transition-transform duration-300 ease-in-out",
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
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
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
              className="block py-4 text-base font-medium hover:text-primary transition-colors border-b border-zinc-200 dark:border-zinc-800 last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Decorative text at bottom */}
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] text-center">
            Creaciones Textiles
          </p>
        </div>
      </div>
    </>
  );
}
