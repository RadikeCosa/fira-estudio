import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StockBadge } from "./StockBadge";
import type { Variacion } from "@/lib/types";

describe("StockBadge", () => {
  const baseVariacion: Variacion = {
    id: "var-1",
    producto_id: "prod-1",
    tamanio: "150x200cm",
    color: "Rojo",
    precio: 15000,
    stock: 5,
    sku: "MAN-150-RED",
    activo: true,
  };

  describe("Stock > 3", () => {
    it("renders green badge with stock count", () => {
      const variacion = { ...baseVariacion, stock: 10 };
      render(<StockBadge variacion={variacion} />);

      expect(screen.getByText("10 disponibles")).toBeInTheDocument();
    });

    it("applies success color classes", () => {
      const variacion = { ...baseVariacion, stock: 5 };
      const { container } = render(<StockBadge variacion={variacion} />);

      const badge = container.querySelector(".bg-success\\/15");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-success");
    });
  });

  describe("Stock 1-3", () => {
    it("renders orange badge with urgency message for stock = 1", () => {
      const variacion = { ...baseVariacion, stock: 1 };
      render(<StockBadge variacion={variacion} />);

      expect(screen.getByText("¡Solo quedan 1!")).toBeInTheDocument();
    });

    it("renders orange badge with urgency message for stock = 3", () => {
      const variacion = { ...baseVariacion, stock: 3 };
      render(<StockBadge variacion={variacion} />);

      expect(screen.getByText("¡Solo quedan 3!")).toBeInTheDocument();
    });

    it("applies warning color classes", () => {
      const variacion = { ...baseVariacion, stock: 2 };
      const { container } = render(<StockBadge variacion={variacion} />);

      const badge = container.querySelector(".bg-warning\\/15");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-warning");
    });
  });

  describe("Stock = 0", () => {
    it("renders yellow badge with 'A pedido' text", () => {
      const variacion = { ...baseVariacion, stock: 0 };
      render(<StockBadge variacion={variacion} />);

      expect(screen.getByText("A pedido")).toBeInTheDocument();
    });

    it("applies info color classes", () => {
      const variacion = { ...baseVariacion, stock: 0 };
      const { container } = render(<StockBadge variacion={variacion} />);

      const badge = container.querySelector(".bg-info\\/15");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-info");
    });
  });

  describe("Inactive variation", () => {
    it("renders red badge with 'No disponible' text", () => {
      const variacion = { ...baseVariacion, activo: false };
      render(<StockBadge variacion={variacion} />);

      expect(screen.getByText("No disponible")).toBeInTheDocument();
    });

    it("applies destructive color classes", () => {
      const variacion = { ...baseVariacion, activo: false };
      const { container } = render(<StockBadge variacion={variacion} />);

      const badge = container.querySelector(".bg-destructive\\/15");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-destructive");
    });

    it("shows 'No disponible' even when stock > 0", () => {
      const variacion = { ...baseVariacion, activo: false, stock: 10 };
      render(<StockBadge variacion={variacion} />);

      expect(screen.getByText("No disponible")).toBeInTheDocument();
      expect(screen.queryByText("10 disponibles")).not.toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("applies custom className when provided", () => {
      const variacion = { ...baseVariacion };
      const { container } = render(
        <StockBadge variacion={variacion} className="mt-4" />
      );

      const badge = container.querySelector(".mt-4");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Visual indicator dot", () => {
    it("renders colored dot for all badge types", () => {
      const { container } = render(<StockBadge variacion={baseVariacion} />);

      const dot = container.querySelector(".h-2.w-2.rounded-full");
      expect(dot).toBeInTheDocument();
    });
  });
});
