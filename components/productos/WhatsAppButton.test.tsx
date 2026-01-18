import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatsAppButton } from "./WhatsAppButton";
import type { Producto, Variacion } from "@/lib/types";

// Mock the analytics module
vi.mock("@/lib/analytics/gtag", () => ({
  trackWhatsAppClick: vi.fn(),
}));

// Mock useRateLimit hook
vi.mock("@/hooks/useRateLimit", () => ({
  useRateLimit: () => ({
    isRateLimited: false,
    recordAction: () => true,
    timeUntilReset: 0,
  }),
}));

describe("WhatsAppButton", () => {
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

  const mockVariacionEnStock: Variacion = {
    id: "var-1",
    producto_id: "prod-1",
    tamanio: "150x200cm",
    color: "Rojo",
    precio: 15000,
    stock: 5,
    sku: "MAN-150-RED",
    activo: true,
  };

  const mockVariacionAPedido: Variacion = {
    id: "var-2",
    producto_id: "prod-1",
    tamanio: "180x250cm",
    color: "Azul",
    precio: 18500,
    stock: 0,
    sku: "MAN-180-BLUE",
    activo: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Message construction", () => {
    it("includes product name", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("Mantel Floral");
    });

    it("includes variation details when provided", () => {
      const { container } = render(
        <WhatsAppButton producto={mockProducto} variacion={mockVariacionEnStock} />
      );
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("150x200cm");
      expect(decodedMessage).toContain("Rojo");
      expect(decodedMessage).toMatch(/\$\s*15\.000/); // Match with optional space
    });
  });

  describe("Stock-aware messaging", () => {
    it("asks about immediate shipping when stock > 0", () => {
      const { container } = render(
        <WhatsAppButton producto={mockProducto} variacion={mockVariacionEnStock} />
      );
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("¿Está disponible para envío inmediato?");
      expect(decodedMessage).not.toContain("tiempo de fabricación");
    });

    it("asks about production time when stock = 0", () => {
      const { container } = render(
        <WhatsAppButton producto={mockProducto} variacion={mockVariacionAPedido} />
      );
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("¿Cuál es el tiempo de fabricación?");
      expect(decodedMessage).not.toContain("envío inmediato");
    });

    it("asks for general information when no variation selected", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("¿Podrías darme más información?");
      expect(decodedMessage).not.toContain("tiempo de fabricación");
      expect(decodedMessage).not.toContain("envío inmediato");
    });
  });

  describe("WhatsApp URL generation", () => {
    it("generates valid WhatsApp URL with phone number", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";

      expect(href).toMatch(/^https:\/\/wa\.me\/[\dX]+\?text=/); // Allow X in phone number for test env
    });

    it("opens in new tab with proper security attributes", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("UI rendering", () => {
    it("renders button with WhatsApp text", () => {
      render(<WhatsAppButton producto={mockProducto} />);

      expect(screen.getByText("Consultar por WhatsApp")).toBeInTheDocument();
    });

    it("has appropriate styling classes", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");

      expect(link).toHaveClass("from-green-600");
      expect(link).toHaveClass("to-green-500");
    });
  });
});
