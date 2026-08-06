import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";

vi.mock("@/lib/supabase/queries", () => ({
  getProductosFresh: vi.fn(),
}));

const blockedPublicRoutes = [
  "/carrito",
  "/checkout",
  "/checkout/success",
  "/checkout/failure",
  "/checkout/pending",
  "/test-errors",
];

describe("public route indexation", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps commercial and technical routes out of the sitemap", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      "https://fira.example",
      "https://fira.example/productos",
      "https://fira.example/sobre-nosotros",
      "https://fira.example/contacto",
    ]);

    for (const route of blockedPublicRoutes) {
      expect(urls).not.toContain(`https://fira.example${route}`);
    }
  });

  it("adds explicit robots exclusions for historical public surfaces", () => {
    const policy = robots();
    const disallow = policy.rules[0]?.disallow ?? policy.rules.disallow;

    expect(disallow).toEqual(
      expect.arrayContaining([
        "/api/",
        "/carrito",
        "/checkout",
        "/checkout/",
        "/test-errors",
      ]),
    );
  });
});
