import { fireEvent, render, screen, within } from "@testing-library/react";
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
      {
        id: "var-3",
        producto_id: "prod-1",
        tamanio: "220x40",
        color: "Azul",
        precio: 18000,
        stock: 1,
        sku: "CAM-AZU",
        activo: false,
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

    fireEvent.click(screen.getByRole("radio", { name: "180x40" }));
    fireEvent.click(screen.getByRole("radio", { name: "Verde" }));

    expect(screen.getByRole("radio", { name: "180x40" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Verde" })).toBeChecked();
    expect(screen.queryByText(/agregar al carrito/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver carrito/i })).not.toBeInTheDocument();
  });

  it("renders mutually exclusive variant groups with native radio semantics", () => {
    const { container } = render(<ProductActions producto={producto} />);

    const sizeGroup = screen.getByRole("radiogroup", { name: "Tamaño" });
    const colorGroup = screen.getByRole("radiogroup", { name: "Color" });

    expect(within(sizeGroup).getByRole("radio", { name: "140x40" })).toHaveAttribute(
      "type",
      "radio",
    );
    expect(within(colorGroup).getByRole("radio", { name: "Natural" })).toHaveAttribute(
      "type",
      "radio",
    );
    expect(screen.queryByRole("button", { name: "140x40" })).not.toBeInTheDocument();
    expect(container.querySelector("[aria-pressed]")).not.toBeInTheDocument();
  });

  it("keeps inactive variations disabled instead of selectable", () => {
    render(<ProductActions producto={producto} />);

    expect(screen.getByRole("radio", { name: "220x40" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Azul" })).toBeDisabled();
  });

  it("uses catalog availability copy without stock guarantees", () => {
    render(<ProductActions producto={producto} />);

    expect(screen.getByText("Disponibilidad a consultar")).toBeInTheDocument();
    expect(screen.queryByText(/2 disponibles/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sin stock/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/comprar/i)).not.toBeInTheDocument();
  });

  it("updates availability copy after selecting a complete variant", () => {
    render(<ProductActions producto={producto} />);

    fireEvent.click(screen.getByRole("radio", { name: "140x40" }));
    fireEvent.click(screen.getByRole("radio", { name: "Natural" }));

    expect(
      screen.getByText("Disponibilidad a consultar para esta variante"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/disponibles/i)).not.toBeInTheDocument();
  });

  it("keeps the inquiry CTA available without selecting a variation", () => {
    render(<ProductActions producto={producto} />);

    expect(
      screen.getByRole("link", { name: /consultar por este producto/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /consultar por este producto/i })).toHaveAttribute(
      "href",
      expect.stringContaining("Camino%20Magnolia"),
    );
  });

  it("auto-selects a single active variant", () => {
    const singleVariantProduct: ProductoCompleto = {
      ...producto,
      variaciones: [producto.variaciones[0]],
    };

    render(<ProductActions producto={singleVariantProduct} />);

    expect(screen.getByRole("radio", { name: "140x40" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Natural" })).toBeChecked();
    expect(
      screen.getByText("Disponibilidad a consultar para esta variante"),
    ).toBeInTheDocument();
  });

  it("supports products without variations", () => {
    const productWithoutVariations: ProductoCompleto = {
      ...producto,
      variaciones: [],
    };

    render(<ProductActions producto={productWithoutVariations} />);

    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByText("Disponibilidad a consultar")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /consultar por este producto/i }),
    ).toBeInTheDocument();
  });

  it("keeps a safe contact CTA when WhatsApp is not configured", () => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    render(<ProductActions producto={producto} />);

    expect(
      screen.getByRole("link", { name: /consultar por este producto/i }),
    ).toHaveAttribute("href", "/contacto?producto=Camino+Magnolia");
    expect(screen.queryByText(/agregar al carrito/i)).not.toBeInTheDocument();
  });
});
