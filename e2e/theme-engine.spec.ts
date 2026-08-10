import { expect, test, type Browser } from "@playwright/test";
import {
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "../components/theme/theme";

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

test("desktop theme control toggles, persists, and survives navigation", async ({
  browser,
}) => {
  const { context, page } = await openHomeWithThemeContext({
    browser,
    colorScheme: "light",
  });

  await expect(
    page.getByRole("button", { name: "Cambiar a modo oscuro" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY),
    )
    .toBe("dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Productos" })
    .click();
  await expect(page).toHaveURL(/\/productos/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: "Cambiar a modo claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() =>
      page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY),
    )
    .toBe("light");

  await context.close();
});

test("mobile navigation exposes only the compact theme control", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "light",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");

  await expect(
    page.getByRole("banner").getByRole("button", {
      name: "Cambiar a modo oscuro",
    }),
  ).toBeVisible();

  await page
    .getByRole("banner")
    .getByRole("button", { name: "Cambiar a modo oscuro" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await context.close();
});
