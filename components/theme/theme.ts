export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "fira-theme";
export const DEFAULT_THEME: ThemePreference = "system";
export const DEFAULT_RESOLVED_THEME: ResolvedTheme = "light";

const VALID_THEME_PREFERENCES = new Set<ThemePreference>([
  "system",
  "light",
  "dark",
]);

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && VALID_THEME_PREFERENCES.has(value as ThemePreference);
}

export function normalizeThemePreference(value: unknown): ThemePreference {
  return isThemePreference(value) ? value : DEFAULT_THEME;
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}

export function getSystemThemeFromMedia(
  matchesDark: boolean,
): ResolvedTheme {
  return matchesDark ? "dark" : "light";
}

export function getStoredThemePreference(
  storage: Pick<Storage, "getItem"> | undefined,
): ThemePreference {
  try {
    return normalizeThemePreference(storage?.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

export function persistThemePreference(
  storage: Pick<Storage, "setItem"> | undefined,
  preference: ThemePreference,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable in private contexts. Keep runtime theme working.
  }
}

export function applyResolvedTheme(
  root: Pick<HTMLElement, "setAttribute" | "style">,
  resolvedTheme: ResolvedTheme,
): void {
  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme;
}
