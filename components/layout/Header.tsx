import Link from "next/link";
import { MobileNav } from "./MobileNav";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Sobre Nosotros", href: "/sobre-nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function Header(): React.ReactElement {
  return (
    <header
      className="
        sticky top-0 z-40
        bg-background
        border-b border-border
        w-full
      "
    >
      <nav
        className="
          flex items-center justify-between
          px-4 py-4
          sm:px-6
          md:px-8
          md:py-5
          max-w-7xl mx-auto
        "
      >
        {/* Logo/Brand */}
        <Link
          href="/"
          className="
            text-lg font-medium
            md:text-xl
            text-foreground
            hover:text-accent
            transition-colors
            duration-200
          "
        >
          Muma Estudio
        </Link>

        {/* Desktop Navigation */}
        <ul
          className="
            hidden
            md:flex
            items-center
            gap-8
            list-none
            m-0
            p-0
          "
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="
                  text-sm
                  text-foreground
                  font-normal
                  hover:text-accent
                  transition-colors
                  duration-200
                  pb-1
                  border-b-2
                  border-transparent
                  hover:border-accent
                "
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav links={navLinks} />
        </div>
      </nav>
    </header>
  );
}
