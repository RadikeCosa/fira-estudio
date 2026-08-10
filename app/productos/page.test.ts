import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { Metadata } from "next";
import ProductosPage, { generateMetadata } from "./page";
import { getCategorias, getProductos } from "@/lib/supabase/queries";
import { PRODUCTOS_CONTENT } from "@/lib/content/productos";
import { ABOUT_CONTENT } from "@/lib/content/sobre-nosotros";

vi.mock("@/lib/supabase/queries", () => ({
  getCategorias: vi.fn(),
  getProductos: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const categorias = [
  {
    id: "cat-1",
    nombre: "Manteles",
    slug: "manteles",
    descripcion: "Manteles artesanales",
    orden: 1,
  },
];

function getCanonical(metadata: Metadata): string | undefined {
  const canonical = metadata.alternates?.canonical;
  return typeof canonical === "string" ? canonical : undefined;
}

describe("productos metadata indexation", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example");
    vi.mocked(getCategorias).mockResolvedValue(categorias);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("keeps /productos indexable with a self canonical", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Catálogo de textiles artesanales");
    expect(metadata.description).toBe(
      "Explorá el catálogo de textiles artesanales de Fira Estudio: piezas para la mesa y el hogar con materiales, variantes e imágenes.",
    );
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
    expect(getCategorias).not.toHaveBeenCalled();
  });

  it("marks a valid category filter as noindex follow with /productos canonical", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ categoria: "manteles" }),
    });

    expect(metadata.title).toBe("Manteles");
    expect(metadata.description).toBe("Manteles artesanales");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
  });

  it("marks an unknown category filter as noindex with /productos canonical", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ categoria: "no-existe" }),
    });

    expect(metadata.title).toBe("Catálogo de textiles artesanales");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
  });

  it("does not use invalid category params as category metadata", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ categoria: "../manteles" }),
    });

    expect(metadata.title).toBe("Catálogo de textiles artesanales");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
    expect(getCategorias).not.toHaveBeenCalled();
  });

  it("marks paginated catalog URLs as noindex with /productos canonical", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
  });

  it("marks category pagination as noindex with /productos canonical", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ categoria: "manteles", page: "2" }),
    });

    expect(metadata.title).toBe("Manteles");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
  });

  it("does not allow invalid page params to become indexable surfaces", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: "abc" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
  });

  it("keeps unknown query params from creating arbitrary canonicals", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ utm_source: "newsletter" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
    expect(getCanonical(metadata)).toBe("https://fira.example/productos");
  });

  it("renders a single breadcrumb JSON-LD script for the catalog page", async () => {
    vi.mocked(getProductos).mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 12,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const { container } = render(
      await ProductosPage({ searchParams: Promise.resolve({}) }),
    );
    const jsonLdScripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );

    expect(jsonLdScripts).toHaveLength(1);
    expect(jsonLdScripts[0]?.textContent).toContain("BreadcrumbList");
    expect(jsonLdScripts[0]?.textContent).toContain(
      "https://fira.example/productos",
    );
  });
});

describe("productos content", () => {
  it("uses a specific catalog H1 and concise introduction", () => {
    expect(PRODUCTOS_CONTENT.page.defaultTitle).toBe("Textiles artesanales");
    expect(PRODUCTOS_CONTENT.page.defaultDescription).toBe(
      "Explorá el catálogo de Fira Estudio: piezas textiles para la mesa y el hogar con materiales, variantes e imágenes. La disponibilidad se confirma por consulta.",
    );
  });
});

describe("about content", () => {
  it("does not expose purchase-oriented copy", () => {
    const serialized = JSON.stringify(ABOUT_CONTENT);

    expect(serialized).not.toContain("acompañarte en tu compra");
    expect(serialized).toContain("acompañarte en tu elección");
  });
});
