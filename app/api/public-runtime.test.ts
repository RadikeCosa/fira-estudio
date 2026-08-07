import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.join(process.cwd(), "app");
const apiDir = path.join(appDir, "api");

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

describe("public API runtime surface", () => {
  it("only exposes catalog support API routes", () => {
    const routes = findFiles(apiDir, "route.ts").map((filePath) =>
      path.relative(process.cwd(), filePath),
    );

    expect(routes.sort()).toEqual([
      "app/api/rate-limit/route.ts",
      "app/api/revalidate/route.ts",
    ]);
  });

  it("does not expose historical commerce API routes", () => {
    const removedRoutes = [
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
    const forbiddenImport = /from ["']@\/lib\/(mercadopago|webhooks|repositories\/(cart|order))/;

    for (const filePath of pageFiles) {
      expect(readFile(filePath)).not.toMatch(forbiddenImport);
    }
  });
});
