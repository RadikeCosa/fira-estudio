import { describe, expect, it } from "vitest";
import type { ProductoCompleto } from "@/lib/types";
import { generateProductSchema } from "./structured-data";

describe("generateProductSchema", () => {
  it("describes the product without commercial offer data", () => {
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
      category: "Manteles",
      material: "Algodon",
    });
    expect(serialized).not.toContain(["Of", "fer"].join(""));
    expect(serialized).not.toContain(["Aggregate", "Of", "fer"].join(""));
    expect(serialized).not.toContain("priceCurrency");
    expect(serialized).not.toContain("availability");
  });
});
