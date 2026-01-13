"use client";

import { useState } from "react";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

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

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="
          flex flex-col gap-1.5
          p-1
          hover:bg-gray-100
          rounded-lg
          transition-colors
          duration-200
        "
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span
          className={`
            block h-0.5 w-6 bg-gray-900
            transition-transform duration-300
            ${isOpen ? "rotate-45 translate-y-2" : ""}
          `}
        />
        <span
          className={`
            block h-0.5 w-6 bg-gray-900
            transition-opacity duration-300
            ${isOpen ? "opacity-0" : ""}
          `}
        />
        <span
          className={`
            block h-0.5 w-6 bg-gray-900
            transition-transform duration-300
            ${isOpen ? "-rotate-45 -translate-y-2" : ""}
          `}
        />
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 right-0
            bg-white
            border-b border-gray-200
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
                    text-gray-700
                    hover:bg-gray-50
                    hover:text-gray-900
                    border-b border-gray-100
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
