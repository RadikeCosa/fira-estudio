"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { NavLink } from "@/lib/constants/navigation";

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  // Handle ESC key press and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when menu is open
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      // Handle ESC key press
      const handleEscape = (event: KeyboardEvent): void => {
        if (event.key === "Escape") {
          closeMenu();
        }
      };

      document.addEventListener("keydown", handleEscape);

      // Cleanup function
      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="
          flex flex-col gap-1.5
          p-1
          hover:bg-muted
          rounded-lg
          transition-colors
          duration-200
        "
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span
          className={`
            block h-0.5 w-6 bg-foreground
            transition-transform duration-300
            ${isOpen ? "rotate-45 translate-y-2" : ""}
          `}
        />
        <span
          className={`
            block h-0.5 w-6 bg-foreground
            transition-opacity duration-300
            ${isOpen ? "opacity-0" : ""}
          `}
        />
        <span
          className={`
            block h-0.5 w-6 bg-foreground
            transition-transform duration-300
            ${isOpen ? "-rotate-45 -translate-y-2" : ""}
          `}
        />
      </button>

      {/* Overlay/Backdrop */}
      {isOpen && (
        <div
          className="
            fixed inset-0 top-[57px]
            bg-black/50
            z-40
            animate-in fade-in
            duration-200
          "
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 right-0
            bg-background
            border-b border-border
            z-50
            animate-in fade-in slide-in-from-top-2
            duration-200
          "
        >
          <ul
            className="
              flex flex-col
              list-none
              m-0
              p-0
            "
          >
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="
                    block
                    px-4 py-3
                    text-foreground
                    hover:bg-muted
                    hover:text-foreground
                    border-b border-border
                    last:border-b-0
                    transition-colors
                    duration-200
                  "
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
