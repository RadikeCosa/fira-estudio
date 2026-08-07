"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/constants/navigation";
import { COMPONENTS } from "@/lib/design/tokens";

interface ActiveNavLinksProps {
  links: NavLink[];
}

export function isNavLinkActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/productos") {
    return pathname === "/productos" || pathname.startsWith("/productos/");
  }

  return pathname === href;
}

export function ActiveNavLinks({ links }: ActiveNavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = isNavLinkActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={COMPONENTS.header.navLink}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
