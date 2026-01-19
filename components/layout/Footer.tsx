import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/constants/navigation";

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
    <footer className="py-12 px-6 max-w-lg mx-auto text-center border-t border-zinc-200 dark:border-zinc-800">
      {/* Logo & Subtitle */}
      <div className="mb-10">
        <h2 className="font-display text-2xl tracking-widest uppercase mb-2">
          {SITE_CONFIG.name}
        </h2>
        <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase">
          Creaciones Textiles y Digitales
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex justify-center gap-8 mb-12" aria-label="Enlaces principales">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Social Links */}
      <div className="flex justify-center gap-6 mb-12" aria-label="Redes sociales">
        {/* Instagram */}
        <a
          href="https://instagram.com/mumaestudio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          aria-label="Instagram de Muma Estudio"
        >
          <Instagram className="w-6 h-6" aria-hidden="true" />
        </a>

        {/* Email */}
        <a
          href={`mailto:${SITE_CONFIG.email}`}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          aria-label="Enviar email a Muma Estudio"
        >
          <Mail className="w-6 h-6" aria-hidden="true" />
        </a>
      </div>

      {/* Copyright */}
      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
        © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
