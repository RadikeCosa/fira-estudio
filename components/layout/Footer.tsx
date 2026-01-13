import Link from "next/link";
import { Instagram, Mail } from "lucide-react";

const links = [
  { label: "Productos", href: "/productos" },
  { label: "Sobre Nosotros", href: "/sobre-nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-foreground text-sm py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4 items-center sm:flex-row sm:justify-between sm:gap-0">
        {/* Marca y tagline */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="font-medium">Muma Estudio</span>
          <span className="text-xs text-accent mt-1">
            Creaciones Textiles y Digitales
          </span>
        </div>

        {/* Enlaces principales */}
        <nav className="flex gap-4">
          {links.map((link) => (
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
            href="https://instagram.com/mumaestudio"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </Link>
          <Link
            href="mailto:contacto@mumaestudio.com"
            aria-label="Email"
            className="hover:text-accent transition-colors"
          >
            <Mail className="h-4 w-4" />
          </Link>
          <span className="ml-2 text-xs text-accent/70">
            © {year} Muma Estudio
          </span>
        </div>
      </div>
    </footer>
  );
}
