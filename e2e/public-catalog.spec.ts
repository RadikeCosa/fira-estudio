import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile-small", width: 360, height: 640 },
  { name: "mobile-modern", width: 390, height: 844 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "small-desktop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasOverflow).toBe(false);
}

async function getFirstProductLink(page: Page) {
  return page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Ver detalle" })
    .first();
}

test.describe("public catalog responsive surfaces", () => {
  for (const viewport of VIEWPORTS) {
    test(`has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const path of ["/", "/productos", "/contacto"]) {
        await page.goto(path);
        await expectNoHorizontalOverflow(page);
      }
    });
  }
});

test("home to catalog navigation works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();

  await page.getByRole("link", { name: /^productos$/i }).first().click();
  await expect(page).toHaveURL(/\/productos/);
  await expect(page.getByRole("main")).toBeVisible();

  await page.getByRole("link", { name: /fira estudio/i }).click();
  await expect(page).toHaveURL("/");
});

test("catalog listing and optional product detail are navigable", async ({
  page,
}) => {
  await page.goto("/productos");
  await expect(page.getByRole("main")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const categoryFilter = page.getByRole("tablist", { name: /categor/i });
  if (await categoryFilter.isVisible().catch(() => false)) {
    await expect(categoryFilter.getByRole("tab").first()).toBeVisible();
  }

  const firstProduct = await getFirstProductLink(page);
  if ((await firstProduct.count()) === 0) {
    const emptyStateLink = page.getByRole("link", {
      name: "Ver todos los productos",
    });
    const loadingError = page.getByRole("heading", {
      name: "Error al cargar datos",
    });
    const globalError = page.getByRole("heading", {
      name: "Algo salió mal",
    });

    await expect(emptyStateLink.or(loadingError).or(globalError)).toBeVisible();
    return;
  }

  await firstProduct.click();
  await expect(page).toHaveURL(/\/productos\/[^/?#]+/);
  await expect(page.getByRole("main")).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const sizeOption = page.getByRole("radio").first();
  if ((await sizeOption.count()) > 0 && (await sizeOption.isEnabled())) {
    await sizeOption.focus();
    await page.keyboard.press("Space");
    await expect(sizeOption).toBeChecked();
  }

  await expect(
    page.getByRole("link", { name: /consultar por este producto/i }),
  ).toBeVisible();
});
