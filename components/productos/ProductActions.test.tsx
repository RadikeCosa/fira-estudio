import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ProductoCompleto } from "@/lib/types";
import { ProductActions } from "./ProductActions";

vi.mock("@/lib/analytics/gtag", () => ({
  trackProductInquiry: vi.fn(),
}));

describe("ProductActions", () => {
  const producto: ProductoCompleto = {
    id: "prod-1",
    nombre: "Camino Magnolia",
    slug: "camino-magnolia",
    descripcion: "Camino artesanal estampado",
    categoria_id: "cat-1",
    precio_desde: 12000,
    destacado: true,
    activo: true,
    tiempo_fabricacion: "7 dias",
    material: "Tusor",
    cuidados: "Lavar con agua fria",
    created_at: "2024-01-01T00:00:00Z",
    categoria: null,
    imagenes: [],
    variaciones: [
      {
        id: "var-1",
        producto_id: "prod-1",
        tamanio: "140x40",
        color: "Natural",
        precio: 12000,
        stock: 2,
        sku: "CAM-NAT",
        activo: true,
      },
      {
        id: "var-2",
        producto_id: "prod-1",
        tamanio: "180x40",
        color: "Verde",
        precio: 15000,
        stock: 0,
        sku: "CAM-VER",
        activo: true,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5492999123456";
  });

  it("renders inquiry CTA instead of add to cart", () => {
    render(<ProductActions producto={producto} />);

    expect(
      screen.getByRole("link", { name: /consultar por este producto/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/agregar al carrito/i)).not.toBeInTheDocument();
  });

  it("does not call cart actions when selecting variants", () => {
    render(<ProductActions producto={producto} />);

    fireEvent.click(screen.getByRole("button", { name: "180x40" }));
    fireEvent.click(screen.getByRole("button", { name: "Verde" }));

    expect(screen.getByRole("button", { name: "180x40" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Verde" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText(/agregar al carrito/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver carrito/i })).not.toBeInTheDocument();
  });

  it("keeps a safe contact CTA when WhatsApp is not configured", () => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    render(<ProductActions producto={producto} />);

    expect(
      screen.getByRole("link", { name: /consultar por este producto/i }),
    ).toHaveAttribute("href", "/contacto");
    expect(screen.queryByText(/agregar al carrito/i)).not.toBeInTheDocument();
  });
});
