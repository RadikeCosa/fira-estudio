/**
 * Tests for ProductViewTracker component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ProductViewTracker } from "./ProductViewTracker";
import * as gtag from "@/lib/analytics/gtag";
import type { Producto } from "@/lib/types";

// Mock the gtag module
vi.mock("@/lib/analytics/gtag", () => ({
  trackProductView: vi.fn(),
}));

const mockProducto: Producto = {
  id: "prod-1",
  nombre: "Mantel Floral",
  slug: "mantel-floral",
  descripcion: "Hermoso mantel artesanal",
  categoria_id: "cat-1",
  precio_desde: 15000,
  destacado: true,
  activo: true,
  tiempo_fabricacion: "3-5 días",
  material: "Algodón 100%",
  cuidados: "Lavar a mano",
  created_at: "2024-01-01T00:00:00Z",
};

describe("ProductViewTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without visible content", () => {
    const { container } = render(
      <ProductViewTracker producto={mockProducto} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls trackProductView on mount", () => {
    render(<ProductViewTracker producto={mockProducto} />);
    expect(gtag.trackProductView).toHaveBeenCalledTimes(1);
    expect(gtag.trackProductView).toHaveBeenCalledWith(mockProducto);
  });

  it("calls trackProductView again when producto changes", () => {
    const { rerender } = render(<ProductViewTracker producto={mockProducto} />);
    expect(gtag.trackProductView).toHaveBeenCalledTimes(1);

    const updatedProducto = {
      ...mockProducto,
      id: "prod-2",
      nombre: "Camino de Mesa",
    };
    rerender(<ProductViewTracker producto={updatedProducto} />);

    expect(gtag.trackProductView).toHaveBeenCalledTimes(2);
    expect(gtag.trackProductView).toHaveBeenCalledWith(updatedProducto);
  });
});
