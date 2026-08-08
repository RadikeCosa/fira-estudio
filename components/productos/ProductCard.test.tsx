import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import type { Producto, Categoria } from "@/lib/types";

describe("ProductCard", () => {
  const mockProducto: Producto = {
    id: "prod-1",
    nombre: "Mantel Floral",
    slug: "mantel-floral",
    descripcion: "Mantel artesanal con diseño floral",
    categoria_id: "cat-1",
    precio_desde: 15000,
    destacado: false,
    activo: true,
    tiempo_fabricacion: "3-5 días",
    material: "Algodón 100%",
    cuidados: "Lavar a mano",
    created_at: "2024-01-01T00:00:00Z",
  };
  const mockCategoria: Pick<Categoria, "nombre"> = { nombre: "Manteles" };

  it("renders product information correctly", () => {
    render(<ProductCard producto={mockProducto} />);

    expect(screen.getByText("Mantel Floral")).toBeInTheDocument();
    expect(screen.getByText(/Precio de referencia desde \$/)).toBeInTheDocument();
  });

  it("renders lightweight context when category and material are available", () => {
    render(
      <ProductCard
        producto={{ ...mockProducto, categoria: mockCategoria }}
      />,
    );

    expect(screen.getByText("Manteles · Algodón 100%")).toBeInTheDocument();
  });

  it("renders image with correct alt text", () => {
    render(<ProductCard producto={mockProducto} />);

    const image = screen.getByAltText(
      "Mantel Floral - Textil artesanal de Fira Estudio",
    );
    expect(image).toBeInTheDocument();
  });

  it("renders custom image when provided", () => {
    const customImage = "/images/productos/custom.jpg";
    render(
      <ProductCard producto={mockProducto} imagenPrincipal={customImage} />,
    );

    const image = screen.getByAltText(
      "Mantel Floral - Textil artesanal de Fira Estudio",
    );
    expect(image).toHaveAttribute("src", expect.stringContaining("custom.jpg"));
  });

  it("formats price correctly with peso sign", () => {
    render(<ProductCard producto={mockProducto} />);

    const priceElement = screen.getByText(/Precio de referencia desde \$ 15\.000/);
    expect(priceElement).toBeInTheDocument();
  });

  it("renders link to product detail page", () => {
    render(<ProductCard producto={mockProducto} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/productos/mantel-floral");
  });

  it("renders destacado badge when producto.destacado is true", () => {
    const destacadoProducto = { ...mockProducto, destacado: true };
    render(<ProductCard producto={destacadoProducto} />);

    expect(screen.getByText("Destacado")).toBeInTheDocument();
  });

  it("does not render destacado badge when producto.destacado is false", () => {
    render(<ProductCard producto={mockProducto} />);

    expect(screen.queryByText("Destacado")).not.toBeInTheDocument();
  });

  it("does not render price when precio_desde is null", () => {
    const productoSinPrecio = { ...mockProducto, precio_desde: null };
    render(<ProductCard producto={productoSinPrecio} />);

    expect(screen.queryByText(/Precio de referencia/)).not.toBeInTheDocument();
  });

  it("uses placeholder image when no imagenPrincipal provided", () => {
    render(<ProductCard producto={mockProducto} />);

    const image = screen.getByAltText(
      "Mantel Floral - Textil artesanal de Fira Estudio",
    );
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("placeholder-image.jpeg"),
    );
  });

  it("has correct link structure for accessibility", () => {
    render(<ProductCard producto={mockProducto} />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("group");
    expect(screen.getByText("Ver detalle")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not break when optional context is missing", () => {
    render(<ProductCard producto={{ ...mockProducto, material: null }} />);

    expect(screen.getByText("Mantel Floral")).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });
});
