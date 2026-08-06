import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  buildProductInquiryMessage,
  WhatsAppButton,
} from "./WhatsAppButton";
import type { Producto, Variacion } from "@/lib/types";
import { trackProductInquiry } from "@/lib/analytics/gtag";

// Mock the analytics module
vi.mock("@/lib/analytics/gtag", () => ({
  trackProductInquiry: vi.fn(),
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
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5492999123456";
  });

  describe("Message construction", () => {
    it("builds a concise product inquiry message", () => {
      const message = buildProductInquiryMessage(mockProducto);

      expect(message).toBe(
        "Hola, queria consultar por Mantel Floral. ¿Esta disponible?",
      );
      expect(message).not.toContain("comprarlo");
      expect(message).not.toContain("pagar");
    });

    it("builds a concise product inquiry message with variation", () => {
      const message = buildProductInquiryMessage(
        mockProducto,
        mockVariacionEnStock,
      );

      expect(message).toBe(
        "Hola, queria consultar por Mantel Floral, variante 150x200cm / Rojo. ¿Esta disponible?",
      );
    });

    it("includes product name", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("Mantel Floral");
      expect(decodedMessage).toContain("consultar");
    });

    it("includes variation details when provided", () => {
      const { container } = render(
        <WhatsAppButton
          producto={mockProducto}
          variacion={mockVariacionEnStock}
        />,
      );
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("150x200cm");
      expect(decodedMessage).toContain("Rojo");
      expect(decodedMessage).not.toContain("$");
    });
  });

  describe("Stock-aware messaging", () => {
    it("does not invent stock availability when stock > 0", () => {
      const { container } = render(
        <WhatsAppButton
          producto={mockProducto}
          variacion={mockVariacionEnStock}
        />,
      );
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("¿Esta disponible?");
      expect(decodedMessage).not.toContain("disponible en stock");
      expect(decodedMessage).not.toContain("a pedido");
    });

    it("does not invent production status when stock = 0", () => {
      const { container } = render(
        <WhatsAppButton
          producto={mockProducto}
          variacion={mockVariacionAPedido}
        />,
      );
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("¿Esta disponible?");
      expect(decodedMessage).not.toContain("a pedido");
      expect(decodedMessage).not.toContain("disponible en stock");
    });

    it("asks for general information when no variation selected", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";
      const decodedMessage = decodeURIComponent(href);

      expect(decodedMessage).toContain("queria consultar");
      expect(decodedMessage).toContain("Mantel Floral");
    });
  });

  describe("WhatsApp URL generation", () => {
    it("generates valid WhatsApp URL with phone number", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");
      const href = link?.getAttribute("href") || "";

      expect(href).toMatch(/^https:\/\/wa\.me\/5492999123456\?text=/);
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

      expect(screen.getByText("Consultar por este producto")).toBeInTheDocument();
    });

    it("has appropriate styling classes", () => {
      const { container } = render(<WhatsAppButton producto={mockProducto} />);
      const link = container.querySelector("a");

      expect(link).toHaveClass("from-green-600");
      expect(link).toHaveClass("to-green-500");
    });

    it("uses a safe contact fallback when WhatsApp number is missing", () => {
      delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

      render(<WhatsAppButton producto={mockProducto} />);

      const link = screen.getByRole("link", {
        name: /consultar por este producto/i,
      });
      expect(link).toHaveAttribute("href", "/contacto");
      expect(screen.getByRole("status")).toHaveTextContent(
        "WhatsApp no está configurado",
      );
      expect(link.getAttribute("href")).not.toContain("wa.me");
    });
  });

  describe("Analytics", () => {
    it("tracks product inquiry without ecommerce conversion events", () => {
      render(<WhatsAppButton producto={mockProducto} />);

      fireEvent.click(
        screen.getByRole("link", { name: /consultar por este producto/i }),
      );

      expect(trackProductInquiry).toHaveBeenCalledWith(
        mockProducto,
        undefined,
        "whatsapp",
      );
    });
  });
});
