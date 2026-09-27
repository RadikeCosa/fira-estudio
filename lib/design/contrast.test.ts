import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getContrastRatio } from "./contrast";

const stylesheet = readFileSync("app/globals.css", "utf8");

function getThemeTokens(theme: "light" | "dark"): Record<string, string> {
  const themeBlock = stylesheet.match(
    theme === "light"
      ? /:root,\s*html\[data-theme="light"\]\s*\{([^}]+)\}/
      : /html\[data-theme="dark"\]\s*\{([^}]+)\}/,
  );
  if (!themeBlock?.[1]) throw new Error(`Theme block not found: ${theme}`);

  return Object.fromEntries(
    [...themeBlock[1].matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})/g)].map(
      ([, name, value]) => [name, value],
    ),
  );
}

describe("theme color contrast", () => {
  it.each([
    ["light", "foreground", "background", 4.5],
    ["light", "muted-foreground", "background", 4.5],
    ["light", "muted-foreground", "surface", 4.5],
    ["light", "accent", "background", 4.5],
    ["light", "accent", "surface", 4.5],
    ["dark", "foreground", "background", 4.5],
    ["dark", "muted-foreground", "background", 4.5],
    ["dark", "muted-foreground", "surface", 4.5],
    ["dark", "accent", "background", 4.5],
    ["dark", "accent", "surface", 4.5],
  ])("%s %s on %s meets %.1f:1", (theme, foreground, background, minimum) => {
    const tokens = getThemeTokens(theme as "light" | "dark");
    expect(
      getContrastRatio(tokens[String(foreground)], tokens[String(background)]),
    ).toBeGreaterThanOrEqual(Number(minimum));
  });
});
