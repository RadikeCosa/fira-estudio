"use client";

import { useState, useCallback } from "react";

// Altura del header para mobile nav
const HEADER_HEIGHT = 57;

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

  // Memoiza para evitar recrear la función en cada render
  const closeMenu = useCallback((): void => {
    setIsOpen(false);
  }, []);

  // Memoiza para evitar recrear la función en cada render
  const toggleMenu = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  // Lock body scroll when menu is open
  useScrollLock(isOpen);

  // Close menu on ESC key press
  useEscapeKey(closeMenu, isOpen);

  // Focus trap: mantiene el foco dentro del menú móvil cuando está abierto
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    // Selecciona todos los elementos focusables dentro del menú
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

    // Si no hay elementos focusables, no hacer nada
    if (focusable.length === 0) return;

    // Lleva el foco al primer elemento focusable
    focusable[0].focus();

    // Función manejadora para el tabbing cíclico
    function handleTabTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Si Shift+Tab y estamos en el primero, saltar al último
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Si Tab y estamos en el último, saltar al primero
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    // Agrega el event listener para el focus trap
    const menu = menuRef.current;
    menu.addEventListener("keydown", handleTabTrap);

    // Cleanup: elimina el event listener al desmontar o cerrar menú
    return () => {
      menu.removeEventListener("keydown", handleTabTrap);
    };
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
        className={cn(COMPONENTS.mobileNav.hamburger, "z-[60]")}
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

      {/* Overlay/Backdrop (siempre en el DOM) */}
      <div
        className={cn(
          COMPONENTS.mobileNav.overlay,
          "top-[57px] bg-black/40 backdrop-blur-sm fixed left-0 right-0 z-[40] transition-opacity duration-300 ease-out motion-reduce:transition-none",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu (siempre en el DOM) */}
      <div
        ref={menuRef}
        id="mobile-nav-menu"
        className={cn(
          COMPONENTS.mobileNav.mobileMenuAlt,
          "fixed top-[57px] left-0 right-0 z-[50] h-[calc(100vh-57px)] flex flex-col bg-white/95 shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "translate-x-full",
          "will-change-transform",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        tabIndex={-1}
      >
        {/* Links y decorativo ocupan todo el espacio superior */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <ul className="flex flex-col gap-2 px-6 pt-6 pb-4">
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
          {/* Decorative text solo si hay espacio suficiente */}
          {decorativeText && (
            <div className="px-6 pb-6 pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] text-center">
                {decorativeText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
