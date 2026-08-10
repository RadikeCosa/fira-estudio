import { expect, test, type Browser } from "@playwright/test";
import { THEME_STORAGE_KEY, type ThemePreference } from "../components/theme/theme";

async function openHomeWithThemeContext({
  browser,
  colorScheme,
  storedTheme,
}: {
  browser: Browser;
  colorScheme: "light" | "dark";
  storedTheme?: ThemePreference;
}) {
  const context = await browser.newContext({ colorScheme });

  if (storedTheme) {
    await context.addInitScript(
      ({ key, theme }) => {
        window.localStorage.setItem(key, theme);
      },
      { key: THEME_STORAGE_KEY, theme: storedTheme },
    );
  }

  const page = await context.newPage();
  await page.goto("/");

  return { context, page };
}

test("system dark resolves initial html theme to dark", async ({ browser }) => {
  const { context, page } = await openHomeWithThemeContext({
    browser,
    colorScheme: "dark",
  });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.colorScheme))
    .toBe("dark");

  await context.close();
});

test("system light resolves initial html theme to light", async ({ browser }) => {
  const { context, page } = await openHomeWithThemeContext({
    browser,
    colorScheme: "light",
  });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.colorScheme))
    .toBe("light");

  await context.close();
});

test("stored dark preference overrides light system", async ({ browser }) => {
  const { context, page } = await openHomeWithThemeContext({
    browser,
    colorScheme: "light",
    storedTheme: "dark",
  });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await context.close();
});

test("stored light preference overrides dark system", async ({ browser }) => {
  const { context, page } = await openHomeWithThemeContext({
    browser,
    colorScheme: "dark",
    storedTheme: "light",
  });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await context.close();
});
