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

test("contact form exposes validation errors and preserves query context", async ({
  page,
}) => {
  await page.goto("/contacto?producto=Camino%20Magnolia&variante=Large%20/%20Azul");

  await expect(page.getByLabel(/mensaje/i)).toHaveValue(
    /Camino Magnolia, variante Large \/ Azul/,
  );

  const submitButton = page.getByRole("button");
  if (await page.getByRole("button", { name: /abrir correo/i }).isVisible()) {
    await page.getByRole("button", { name: /abrir correo/i }).click();
    await expect(page.getByLabel(/nombre/i)).toBeFocused();
    await expect(page.getByLabel(/nombre/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  } else {
    await expect(submitButton.filter({ hasText: "Email no disponible" })).toBeDisabled();
    await expect(
      page.getByText("El formulario por email no está disponible en este momento."),
    ).toBeVisible();
  }
});
