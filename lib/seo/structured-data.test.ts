import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProductoCompleto } from "@/lib/types";
import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateProductSchema,
} from "./structured-data";

describe("generateProductSchema", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("describes the product without commercial offer data", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example/");

    const producto: ProductoCompleto = {
      id: "prod-1",
      nombre: "Mantel Floral",
      slug: "mantel-floral",
      descripcion: "Mantel artesanal con diseño floral",
      categoria_id: "cat-1",
      precio_desde: 15000,
      destacado: false,
      activo: true,
      tiempo_fabricacion: "3-5 dias",
      material: "Algodon",
      cuidados: "Lavar a mano",
      created_at: "2024-01-01T00:00:00Z",
      categoria: {
        id: "cat-1",
        nombre: "Manteles",
        slug: "manteles",
        descripcion: null,
        orden: 1,
      },
      imagenes: [],
      variaciones: [
        {
          id: "var-1",
          producto_id: "prod-1",
          tamanio: "150x200",
          color: "Rojo",
          precio: 15000,
          stock: 3,
          sku: "MAN-ROJO",
          activo: true,
        },
      ],
    };

    const schema = generateProductSchema(producto);
    const serialized = JSON.stringify(schema);

    expect(schema).toMatchObject({
      "@type": "Product",
      name: "Mantel Floral",
      description: "Mantel artesanal con diseño floral",
      url: "https://fira.example/productos/mantel-floral",
      category: "Manteles",
      material: "Algodon",
    });
    expect(serialized).not.toContain(["Of", "fer"].join(""));
    expect(serialized).not.toContain(["Aggregate", "Of", "fer"].join(""));
    expect(serialized).not.toContain("priceCurrency");
    expect(serialized).not.toContain("availability");
  });

  it("does not emit undefined URLs when the public site URL is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");

    const producto: ProductoCompleto = {
      id: "prod-1",
      nombre: "Mantel Floral",
      slug: "mantel-floral",
      descripcion: "Mantel artesanal con diseño floral",
      categoria_id: "cat-1",
      precio_desde: null,
      destacado: false,
      activo: true,
      tiempo_fabricacion: "3-5 dias",
      material: null,
      cuidados: null,
      created_at: "2024-01-01T00:00:00Z",
      categoria: null,
      imagenes: [
        {
          id: "img-1",
          producto_id: "prod-1",
          url: "/images/productos/mantel.webp",
          alt_text: null,
          orden: 1,
          es_principal: true,
        },
      ],
      variaciones: [],
    };

    const schema = generateProductSchema(producto);
    const serialized = JSON.stringify(schema);

    expect(serialized).not.toContain("undefined");
    expect(schema).toMatchObject({
      url: "http://localhost:3000/productos/mantel-floral",
      image: "http://localhost:3000/images/productos/mantel.webp",
    });
  });

  it("keeps absolute product image URLs intact", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example");

    const producto: ProductoCompleto = {
      id: "prod-1",
      nombre: "Mantel Floral",
      slug: "mantel-floral",
      descripcion: "Mantel artesanal con diseño floral",
      categoria_id: "cat-1",
      precio_desde: null,
      destacado: false,
      activo: true,
      tiempo_fabricacion: "3-5 dias",
      material: null,
      cuidados: null,
      created_at: "2024-01-01T00:00:00Z",
      categoria: null,
      imagenes: [
        {
          id: "img-1",
          producto_id: "prod-1",
          url: "https://cdn.example.com/mantel.webp",
          alt_text: null,
          orden: 1,
          es_principal: true,
        },
      ],
      variaciones: [],
    };

    expect(generateProductSchema(producto)).toMatchObject({
      image: "https://cdn.example.com/mantel.webp",
    });
  });
});

describe("generateBreadcrumbSchema", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves breadcrumb items to absolute URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fira.example/");

    const schema = generateBreadcrumbSchema([
      { name: "Productos", url: "/productos" },
      { name: "Manteles", url: "productos?categoria=manteles" },
    ]);

    expect(schema.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Productos",
        item: "https://fira.example/productos",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Manteles",
        item: "https://fira.example/productos?categoria=manteles",
      },
    ]);
  });
});

describe("generateOrganizationSchema", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves organization URLs without undefined segments", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");

    const schema = generateOrganizationSchema();
    const serialized = JSON.stringify(schema);

    expect(serialized).not.toContain("undefined");
    expect(schema).toMatchObject({
      url: "http://localhost:3000/",
      logo: "http://localhost:3000/images/logo.png",
    });
  });
});
