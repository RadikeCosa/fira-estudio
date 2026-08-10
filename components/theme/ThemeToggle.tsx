"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
}

const toggleButtonClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background";

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";
  const actionLabel = mounted
    ? nextTheme === "dark"
      ? "Cambiar a modo oscuro"
      : "Cambiar a modo claro"
    : "Cambiar tema";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={cn(toggleButtonClasses, className)}
      aria-label={actionLabel}
      title={mounted ? actionLabel : undefined}
    >
      <span className="relative h-5 w-5" aria-hidden="true">
        <Moon
          className="theme-toggle-icon theme-toggle-icon--moon absolute inset-0 h-5 w-5"
          focusable="false"
        />
        <Sun
          className="theme-toggle-icon theme-toggle-icon--sun absolute inset-0 h-5 w-5"
          focusable="false"
        />
      </span>
    </button>
  );
}
