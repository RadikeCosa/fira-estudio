import type { Metadata } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCategorias } from "@/lib/supabase/queries";
import { generateMetadata } from "./page";

vi.mock("@/lib/supabase/queries", () => ({
  getCategorias: vi.fn(),
  getProductos: vi.fn(),
}));

const categories = [
  {
    id: "cat-1",
    nombre: "Manteles",
    slug: "manteles",
    descripcion: "Manteles textiles para la mesa.",
    orden: 1,
  },
];

function canonical(metadata: Metadata): string | undefined {
  const value = metadata.alternates?.canonical;
  return typeof value === "string" ? value : undefined;
}

describe("category metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example");
    vi.mocked(getCategorias).mockResolvedValue(categories);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("makes the first category page indexable with its own canonical", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "manteles" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Manteles");
    expect(metadata.description).toBe("Manteles textiles para la mesa.");
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(canonical(metadata)).toBe(
      "https://fira.example/productos/categoria/manteles",
    );
  });

  it("keeps category pagination crawlable but out of the index", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "manteles" }),
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(canonical(metadata)).toBe(
      "https://fira.example/productos/categoria/manteles",
    );
  });

  it("keeps arbitrary query variants crawlable but out of the index", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "manteles" }),
      searchParams: Promise.resolve({ campaign: "social" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(canonical(metadata)).toBe(
      "https://fira.example/productos/categoria/manteles",
    );
  });

  it("returns noindex metadata for a missing category", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "desconocida" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
