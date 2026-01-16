import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS } from "@/lib/constants/navigation";
import { SITE_CONFIG } from "@/lib/constants"; // ← Importar

export function Header(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border/50 w-full shadow-sm">
      <nav className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-8 md:py-5 max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <Link
          href="/"
          className="
            text-lg font-bold md:text-xl
            text-foreground
            hover:text-foreground/80
            transition-all
            duration-300
          "
        >
          {SITE_CONFIG.name}
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="
                  relative
                  text-sm font-medium
                  text-foreground/80
                  hover:text-foreground
                  transition-colors
                  duration-300
                  pb-1
                  after:absolute
                  after:bottom-0
                  after:left-0
                  after:h-0.5
                  after:w-0
                  after:bg-foreground
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                "
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  );
}
