import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.join(process.cwd(), "app");
const apiDir = path.join(appDir, "api");
const componentsDir = path.join(process.cwd(), "components");
const publicRuntimeDirs = [
  appDir,
  componentsDir,
  path.join(process.cwd(), "lib"),
];

function findFiles(dir: string, fileName: string): string[] {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return findFiles(fullPath, fileName);
    }
    return entry === fileName ? [fullPath] : [];
  });
}

function readFile(filePath: string): string {
  return readFileSync(filePath, "utf8");
}

function findSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return findSourceFiles(fullPath);
    }

    const isSourceFile = /\.(ts|tsx)$/.test(entry);
    const isTestFile = /\.test\.(ts|tsx)$/.test(entry);

    return isSourceFile && !isTestFile ? [fullPath] : [];
  });
}

describe("public API runtime surface", () => {
  it("only exposes catalog support API routes", () => {
    const routes = findFiles(apiDir, "route.ts").map((filePath) =>
      path.relative(process.cwd(), filePath),
    );

    expect(routes.sort()).toEqual(["app/api/revalidate/route.ts"]);
  });

  it("does not expose historical commerce API routes", () => {
    const removedRoutes = [
      "app/api/cart/actions.ts",
      "app/api/checkout/create-preference/route.ts",
      "app/api/checkout/webhook/route.ts",
      "app/api/webhooks/process-queue/route.ts",
      "app/api/webhooks/reconcile/route.ts",
      "app/api/webhooks/status/route.ts",
    ];

    for (const route of removedRoutes) {
      expect(existsSync(path.join(process.cwd(), route))).toBe(false);
    }
  });

  it("keeps public pages free of commercial runtime imports", () => {
    const pageFiles = findFiles(appDir, "page.tsx").filter(
      (filePath) => !filePath.includes(`${path.sep}app${path.sep}api${path.sep}`),
    );
    const forbiddenImport =
      /from ["']@\/lib\/(mercadopago|webhooks|emails|repositories\/(cart|order))/;

    for (const filePath of pageFiles) {
      expect(readFile(filePath)).not.toMatch(forbiddenImport);
    }
  });

  it("does not keep historical cart UI components in the executable tree", () => {
    expect(findSourceFiles(path.join(process.cwd(), "components/carrito"))).toEqual(
      [],
    );
    expect(
      existsSync(path.join(process.cwd(), "components/layout/CartIndicator.tsx")),
    ).toBe(false);
  });

  it("keeps public runtime free of cart actions and historical cart UI imports", () => {
    const sourceFiles = publicRuntimeDirs.flatMap(findSourceFiles);
    const forbiddenRuntimeReferences =
      /app\/api\/cart\/actions|components\/carrito|CartIndicator|AddToCartButton|CheckoutForm/;

    for (const filePath of sourceFiles) {
      expect(readFile(filePath)).not.toMatch(forbiddenRuntimeReferences);
    }
  });

  it("does not keep historical checkout feature flags or URL config in runtime code", () => {
    expect(existsSync(path.join(process.cwd(), "lib/config/urls.ts"))).toBe(
      false,
    );

    const sourceFiles = publicRuntimeDirs.flatMap(findSourceFiles);
    const forbiddenCommerceConfig =
      /IS_CHECKOUT_ENABLED|IS_PUBLIC_CHECKOUT_AVAILABLE|NEXT_PUBLIC_CHECKOUT_ENABLED|CHECKOUT_URLS|WEBHOOK_URL/;

    for (const filePath of sourceFiles) {
      expect(readFile(filePath)).not.toMatch(forbiddenCommerceConfig);
    }
  });

  it("does not keep historical commerce infrastructure in the executable tree", () => {
    expect(
      existsSync(path.join(process.cwd(), "lib/repositories/cart.repository.ts")),
    ).toBe(false);

    const removedSourceDirs = [
      "lib/mercadopago",
      "lib/webhooks",
      "lib/emails",
    ];

    for (const removedDir of removedSourceDirs) {
      expect(findSourceFiles(path.join(process.cwd(), removedDir))).toEqual([]);
    }

    const sourceFiles = publicRuntimeDirs.flatMap(findSourceFiles);
    const forbiddenCommerceRuntime =
      /CartRepository|cart\.repository|mercadopago|MercadoPagoConfig|\bPreference\b|\bPayment\b|queue-processor|reconciliation-job|Resend|@react-email|sendOrderConfirmationEmail|OrderConfirmationEmail|MERCADOPAGO_|WEBHOOK_|CRON_SECRET|RESEND_|SUPABASE_SERVICE_ROLE_KEY/;

    for (const filePath of sourceFiles) {
      expect(readFile(filePath)).not.toMatch(forbiddenCommerceRuntime);
    }
  });

  it("keeps public UI free of cart and checkout links or add-to-cart copy", () => {
    const uiFiles = [appDir, componentsDir].flatMap(findSourceFiles);
    const forbiddenUiReferences =
      /href=["'{`][^"'}`]*(\/carrito|\/checkout)|Agregar al carrito/i;

    for (const filePath of uiFiles) {
      expect(readFile(filePath)).not.toMatch(forbiddenUiReferences);
    }
  });
});
