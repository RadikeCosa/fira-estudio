import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/productos",
  "/productos/categoria/caminos-de-mesa",
  "/productos/camino-mesa-magnolia",
  "/contacto",
  "/sobre-nosotros",
];

test("public pages have no critical or serious WCAG 2.2 AA violations in light and dark themes", async ({
  browser,
}) => {
  for (const theme of ["light", "dark"] as const) {
    const context = await browser.newContext({
      colorScheme: theme,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.addStyleTag({
      content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });

    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await page.addStyleTag({
        content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
      });
      await expect(page.getByRole("main")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter((item) =>
        ["critical", "serious"].includes(item.impact ?? ""),
      );

      expect(serious, `${theme} theme at ${route}`).toEqual([]);
    }

    await context.close();
  }
});

test("skip link moves keyboard focus to the page content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile category selection announces navigation and reaches a product inquiry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/productos");

  const categorySelect = page.getByRole("combobox", { name: "Elegí una categoría" });
  const categorySlug = await categorySelect.locator("option").nth(1).getAttribute("value");
  const categoryName = await categorySelect.locator("option").nth(1).textContent();
  expect(categorySlug).toBeTruthy();
  await categorySelect.selectOption(categorySlug ?? "");
  await expect(page.getByText(`Abriendo categoría ${categoryName}`, { exact: true })).toBeAttached();
  await expect(page).toHaveURL(new RegExp(`/productos/categoria/${categorySlug}$`));

  const detailLink = page.getByRole("link", { name: /ver detalle/i }).first();
  if (await detailLink.count()) {
    await detailLink.click();
    const inquiry = page.getByRole("link", { name: /consultar por este producto/i });
    await expect(inquiry).toBeVisible();
    await expect(inquiry).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  }
});
