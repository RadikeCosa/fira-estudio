"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressBar - Barra de progreso de scroll
 *
 * Muestra el progreso de scroll de la página como una barra fixed en la parte superior.
 * Se actualiza en tiempo real mientras el usuario hace scroll.
 */

interface ProgressBarProps {
  /**
   * Altura de la barra en pixeles (default: 3)
   */
  height?: number;
  /**
   * Color de la barra (Tailwind class, default: bg-accent)
   */
  color?: string;
  /**
   * Custom CSS classes
   */
  className?: string;
  /**
   * Mostrar barra en mobile (default: true)
   */
  showOnMobile?: boolean;
}

export function ProgressBar({
  height = 3,
  color = "bg-accent",
  className,
  showOnMobile = true,
}: ProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll percentage
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Total scrollable distance
      const scrollableDistance = documentHeight - windowHeight;

      // Current scroll percentage (0-100)
      const progress =
        scrollableDistance > 0 ? (scrollTop / scrollableDistance) * 100 : 0;

      setScrollProgress(progress);
    };

    // Initial calculation
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Responsive: ocultar barra en mobile si showOnMobile es false
  const responsiveClass = showOnMobile ? "" : "hidden sm:block";
  return (
    <div
      className={cn(
        "fixed left-0 top-0 w-full z-40 sm:z-50", // z-index menor en mobile
        responsiveClass,
        className,
      )}
      style={{ height: `${height}px` }}
    >
      <div
        className={cn("h-full transition-all duration-150 ease-out", color)}
        style={{ width: `${scrollProgress}%` }}
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        aria-label="Progreso de lectura de la página"
      />
    </div>
  );
}
