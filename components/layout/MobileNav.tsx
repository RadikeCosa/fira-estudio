"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavLink } from "@/lib/constants/navigation";
import { useScrollLock, useEscapeKey } from "@/hooks";
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  // Lock body scroll when menu is open
  useScrollLock(isOpen);

  // Close menu on ESC key press
  useEscapeKey(closeMenu, isOpen);

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={COMPONENTS.mobileNav.hamburger}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            COMPONENTS.mobileNav.hamburgerLine,
            isOpen && "rotate-45 translate-y-2"
          )}
        />
        <span
          className={cn(
            COMPONENTS.mobileNav.hamburgerLine,
            isOpen && "opacity-0"
          )}
        />
        <span
          className={cn(
            COMPONENTS.mobileNav.hamburgerLine,
            isOpen && "-rotate-45 -translate-y-2"
          )}
        />
      </button>

      {/* Overlay/Backdrop */}
      {isOpen && (
        <div
          className={cn(COMPONENTS.mobileNav.overlay, "top-[57px]")}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className={COMPONENTS.mobileNav.mobileMenuAlt}>
          <ul className="flex flex-col list-none m-0 p-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className={COMPONENTS.mobileNav.menuLink}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
