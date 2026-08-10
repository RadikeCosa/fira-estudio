import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  getStoredThemePreference,
  getSystemThemeFromMedia,
  normalizeThemePreference,
  resolveThemePreference,
} from "./theme";

describe("theme helpers", () => {
  it("defaults missing storage to system", () => {
    expect(getStoredThemePreference(undefined)).toBe(DEFAULT_THEME);
  });

  it.each(["light", "dark", "system"] as const)(
    "accepts valid %s preference",
    (preference) => {
      expect(normalizeThemePreference(preference)).toBe(preference);
    },
  );

  it("ignores invalid storage values", () => {
    const storage = {
      getItem: (key: string) => (key === THEME_STORAGE_KEY ? "sepia" : null),
    };

    expect(getStoredThemePreference(storage)).toBe("system");
  });

  it("resolves system against dark media", () => {
    expect(resolveThemePreference("system", "dark")).toBe("dark");
    expect(getSystemThemeFromMedia(true)).toBe("dark");
  });

  it("resolves system against light media", () => {
    expect(resolveThemePreference("system", "light")).toBe("light");
    expect(getSystemThemeFromMedia(false)).toBe("light");
  });

  it("manual dark overrides light system", () => {
    expect(resolveThemePreference("dark", "light")).toBe("dark");
  });

  it("manual light overrides dark system", () => {
    expect(resolveThemePreference("light", "dark")).toBe("light");
  });
});
