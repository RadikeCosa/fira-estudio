"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyResolvedTheme,
  DEFAULT_RESOLVED_THEME,
  DEFAULT_THEME,
  getStoredThemePreference,
  getSystemThemeFromMedia,
  persistThemePreference,
  resolveThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getBrowserSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return DEFAULT_RESOLVED_THEME;
  }

  return getSystemThemeFromMedia(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

function getInitialThemeState(): Pick<ThemeContextValue, "theme" | "resolvedTheme"> {
  if (typeof window === "undefined") {
    return {
      theme: DEFAULT_THEME,
      resolvedTheme: DEFAULT_RESOLVED_THEME,
    };
  }

  const theme = getStoredThemePreference(window.localStorage);
  const resolvedTheme = resolveThemePreference(theme, getBrowserSystemTheme());

  return { theme, resolvedTheme };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ theme, resolvedTheme }, setThemeState] = useState(
    getInitialThemeState,
  );

  const setTheme = useCallback(
    (nextTheme: ThemePreference) => {
      persistThemePreference(
        typeof window === "undefined" ? undefined : window.localStorage,
        nextTheme,
      );

      setThemeState({
        theme: nextTheme,
        resolvedTheme: resolveThemePreference(
          nextTheme,
          getBrowserSystemTheme(),
        ),
      });
    },
    [],
  );

  useEffect(() => {
    applyResolvedTheme(document.documentElement, resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setThemeState((currentThemeState) => {
        if (currentThemeState.theme !== "system") {
          return currentThemeState;
        }

        return {
          theme: "system",
          resolvedTheme: getSystemThemeFromMedia(event.matches),
        };
      });
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
