import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProductoCompleto } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";

const producto: ProductoCompleto = {
  id: "prod-1",
  nombre: "Camino Magnolia",
  slug: "camino-magnolia",
  descripcion: "Camino artesanal estampado",
  categoria_id: "cat-1",
  precio_desde: 12000,
  destacado: false,
  activo: true,
  tiempo_fabricacion: "7 días",
  material: "Tusor",
  cuidados: null,
  created_at: "2024-01-01T00:00:00Z",
  categoria: {
    id: "cat-1",
    nombre: "Caminos de mesa",
    slug: "caminos",
    descripcion: null,
    orden: 1,
  },
  variaciones: [],
  imagenes: [],
};

describe("ProductGrid", () => {
  it("renders a clear empty state with recovery action", () => {
    render(<ProductGrid productos={[]} />);

    expect(screen.getByText("No hay productos disponibles")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver todos los productos" }),
    ).toHaveAttribute("href", "/productos");
  });

  it("renders products normally", () => {
    render(<ProductGrid productos={[producto]} />);

    expect(screen.getByText("Camino Magnolia")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Camino Magnolia/i }),
    ).toHaveAttribute("href", "/productos/camino-magnolia");
    expect(screen.queryByText("No hay productos disponibles")).not.toBeInTheDocument();
  });
});
