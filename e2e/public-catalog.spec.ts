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

async function expectLoadedImage(locator: ReturnType<Page["locator"]>) {
  await expect(locator).toBeVisible();
  await expect
    .poll(async () =>
      locator.evaluate(
        (img) =>
          img instanceof HTMLImageElement &&
          img.complete &&
          img.naturalWidth > 0,
      ),
    )
    .toBe(true);
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
  await expect(firstProduct).toBeVisible();

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

test("real Supabase catalog data renders catalog, filter, detail, gallery, and inquiry context", async ({
  page,
}) => {
  await page.goto("/productos");
  await expect(page.getByRole("main")).toBeVisible();

  await expect(page.locator("main a").filter({ hasText: "Ver detalle" })).toHaveCount(
    8,
  );
  await expect(page.getByText("Camino de Mesa Magnolia")).toBeVisible();

  await page.getByRole("tab", { name: "Caminos de Mesa" }).click();
  await expect(page).toHaveURL(/categoria=caminos-de-mesa/);
  await expect(page.getByRole("tab", { name: "Caminos de Mesa" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("main a").filter({ hasText: "Ver detalle" })).toHaveCount(
    1,
  );

  await page.goto("/productos/camino-mesa-magnolia");
  await expect(page.getByRole("heading", { name: "Camino de Mesa Magnolia" })).toBeVisible();
  await expectLoadedImage(page.locator("main img").first());
  await expect(page.getByText("Disponibilidad a consultar")).toBeVisible();
  await expect(page.getByText(/^Material:/)).toBeVisible();

  await page.getByRole("tab", { name: /Ver imagen 2/i }).click();
  await expect(page.getByRole("tab", { name: /Ver imagen 2/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  const sizeOption = page.getByRole("radio", { name: "270x140" });
  await sizeOption.focus();
  await page.keyboard.press("Space");
  await expect(sizeOption).toBeChecked();

  const colorOption = page.getByRole("radio", {
    name: "Crudo con Estampado Chocolate",
  });
  await colorOption.focus();
  await page.keyboard.press("Space");
  await expect(colorOption).toBeChecked();
  const inquiry = page.getByRole("link", {
    name: /consultar por este producto/i,
  });
  await expect(inquiry).toBeVisible();

  const href = await inquiry.getAttribute("href");
  expect(href).toBeTruthy();

  if (href?.startsWith("/contacto")) {
    await page.goto(href);
    await expect(
      page.getByText(
        /Camino de Mesa Magnolia · 270x140 \/ Crudo con Estampado Chocolate/,
      ),
    ).toBeVisible();
    await expect(page.getByLabel(/mensaje/i)).toHaveCount(0);

    const whatsappCta = page.getByRole("link", {
      name: /consultar por whatsapp/i,
    });
    if (await whatsappCta.isVisible()) {
      const contactHref = await whatsappCta.getAttribute("href");
      expect(decodeURIComponent(contactHref ?? "")).toContain(
        "Camino de Mesa Magnolia, variante 270x140 / Crudo con Estampado Chocolate",
      );
    }
  } else {
    const decodedHref = decodeURIComponent(href ?? "");
    expect(decodedHref).toContain("Camino de Mesa Magnolia");
    expect(decodedHref).toContain("270x140 / Crudo con Estampado Chocolate");
    expect(decodedHref).not.toMatch(/precio|stock|\$/i);
  }
});
