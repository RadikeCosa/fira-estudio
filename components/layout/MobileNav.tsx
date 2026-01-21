"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavLink } from "@/lib/constants/navigation";
import { useScrollLock, useEscapeKey } from "@/hooks";
import { COMPONENTS } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

import { useRef, useEffect } from "react";

interface MobileNavProps {
  links: NavLink[];
  logo?: React.ReactNode;
  decorativeText?: string;
}

export function MobileNav({
  links,
  logo,
  decorativeText,
}: MobileNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Focus trap: keep focus inside menu when open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) focusable[0].focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    menuRef.current.addEventListener("keydown", handleTab);
    return () => menuRef.current?.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Restore focus to hamburger button when menu closes
  useEffect(() => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div>
      {/* Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={COMPONENTS.mobileNav.hamburger}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
      >
        <span
          className={cn(
            COMPONENTS.mobileNav.hamburgerLine,
            isOpen && "rotate-45 translate-y-2",
          )}
        />
        <span
          className={cn(
            COMPONENTS.mobileNav.hamburgerLine,
            isOpen && "opacity-0",
          )}
        />
        <span
          className={cn(
            COMPONENTS.mobileNav.hamburgerLine,
            isOpen && "-rotate-45 -translate-y-2",
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
        <div
          ref={menuRef}
          id="mobile-nav-menu"
          className={COMPONENTS.mobileNav.mobileMenuAlt}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          {/* Logo (opcional) */}
          {logo && (
            <div className="flex justify-center items-center p-6">
              <span className="text-lg font-bold">{logo}</span>
            </div>
          )}
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button
              onClick={closeMenu}
              className={COMPONENTS.mobileNav.closeButton}
              aria-label="Cerrar menú"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
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
          {/* Decorative text at bottom (opcional) */}
          {decorativeText && (
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] text-center">
                {decorativeText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
