import { expect, test } from "@playwright/test";

test("mobile navigation opens, traps focus, closes, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.locator('[aria-controls="mobile-nav-menu"]');
  await expect(menuButton).toBeVisible();
  await menuButton.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: /menú de navegación/i });
  await expect(dialog).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByRole("link", { name: /^inicio$/i })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();

  await page.keyboard.press("Enter");
  await dialog.getByRole("link", { name: /^productos$/i }).click();
  await expect(page).toHaveURL(/\/productos/);
  await expect(dialog).toBeHidden();
});

test("contact page exposes direct channels and preserves query context", async ({
  page,
}) => {
  await page.goto("/contacto?producto=Camino%20Magnolia&variante=Large%20/%20Azul");

  await expect(
    page.getByRole("heading", { level: 1, name: "Contacto" }),
  ).toBeVisible();
  await expect(page.getByText(/Camino Magnolia · Large \/ Azul/)).toBeVisible();
  await expect(page.getByLabel(/mensaje/i)).toHaveCount(0);
  await expect(page.getByLabel(/nombre/i)).toHaveCount(0);

  const whatsappCta = page.getByRole("link", {
    name: /consultar por whatsapp/i,
  });
  const instagramLink = page.getByRole("link", { name: "Ver Instagram" });
  const emailLink = page.locator('a[href^="mailto:"]');
  const emptyState = page.getByText(
    /Por ahora no hay un canal de contacto disponible/i,
  );

  if (await whatsappCta.isVisible()) {
    const href = await whatsappCta.getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain(
      "Camino Magnolia, variante Large / Azul",
    );
  } else {
    const hasInstagram = await instagramLink.isVisible();
    const hasEmail =
      (await emailLink.count()) > 0 && (await emailLink.first().isVisible());
    const hasEmptyState = await emptyState.isVisible();

    expect(hasInstagram || hasEmail || hasEmptyState).toBe(true);

    if (hasEmail) {
      await expect(emailLink.first()).toHaveAttribute("href", /^mailto:/);
    }

    if (hasEmptyState) {
      expect(hasInstagram).toBe(false);
      expect(hasEmail).toBe(false);
    }
  }
});
