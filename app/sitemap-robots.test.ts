import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";
import { getCategoriasFresh, getProductosFresh } from "@/lib/supabase/queries";

vi.mock("@/lib/supabase/queries", () => ({
  getProductosFresh: vi.fn(),
  getCategoriasFresh: vi.fn(),
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

  it("lists category landing pages when the catalog data source is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://fira.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-test-key");
    vi.mocked(getCategoriasFresh).mockResolvedValue([
      {
        id: "cat-1",
        nombre: "Manteles",
        slug: "manteles",
        descripcion: "Manteles artesanales",
        orden: 1,
      },
    ]);
    vi.mocked(getProductosFresh).mockResolvedValue({
      items: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 500,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const entries = await sitemap();

    expect(entries.map((entry) => entry.url)).toContain(
      "https://fira.example/productos/categoria/manteles",
    );
  });
});
