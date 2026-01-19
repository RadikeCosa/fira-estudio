/**
 * Tests for Button component with minimalist boutique styles
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button - Boutique Design System", () => {
  describe("Variants", () => {
    it("renders primary variant with correct styles", () => {
      render(<Button variant="primary">Comprar</Button>);
      
      const button = screen.getByText("Comprar");
      expect(button).toBeInTheDocument();
      expect(button.className).toContain("bg-zinc-900");
      expect(button.className).toContain("text-white");
      expect(button.className).toContain("uppercase");
      expect(button.className).toContain("tracking-widest");
    });

    it("renders secondary variant with border", () => {
      render(<Button variant="secondary">Ver Más</Button>);
      
      const button = screen.getByText("Ver Más");
      expect(button.className).toContain("border");
      expect(button.className).toContain("border-zinc-300");
    });

    it("renders accent variant with primary color", () => {
      render(<Button variant="accent">Especial</Button>);
      
      const button = screen.getByText("Especial");
      expect(button.className).toContain("bg-primary");
      expect(button.className).toContain("text-white");
    });

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Cancelar</Button>);
      
      const button = screen.getByText("Cancelar");
      expect(button.className).toContain("hover:bg-zinc-100");
    });
  });

  describe("Sizes", () => {
    it("renders small size", () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByText("Small");
      expect(button.className).toContain("px-6");
      expect(button.className).toContain("py-2.5");
      expect(button.className).toContain("text-xs");
    });

    it("renders medium size (default)", () => {
      render(<Button size="md">Medium</Button>);
      
      const button = screen.getByText("Medium");
      expect(button.className).toContain("px-8");
      expect(button.className).toContain("py-4");
      expect(button.className).toContain("text-sm");
    });

    it("renders large size", () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByText("Large");
      expect(button.className).toContain("px-12");
      expect(button.className).toContain("py-5");
      expect(button.className).toContain("text-base");
    });
  });

  describe("Link functionality", () => {
    it("renders as internal link when href is provided", () => {
      render(<Button href="/productos">Ver Productos</Button>);
      
      const link = screen.getByText("Ver Productos");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/productos");
    });

    it("renders as external link with target blank", () => {
      render(
        <Button href="https://example.com" external>
          Sitio Externo
        </Button>
      );
      
      const link = screen.getByText("Sitio Externo");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Button element", () => {
    it("renders as button element when no href", () => {
      render(<Button>Click Me</Button>);
      
      const button = screen.getByText("Click Me");
      expect(button.tagName).toBe("BUTTON");
    });

    it("supports disabled state", () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByText("Disabled");
      expect(button).toBeDisabled();
      expect(button.className).toContain("disabled:opacity-50");
      expect(button.className).toContain("disabled:cursor-not-allowed");
    });

    it("applies custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      
      const button = screen.getByText("Custom");
      expect(button.className).toContain("custom-class");
    });
  });

  describe("Default behavior", () => {
    it("defaults to primary variant and medium size", () => {
      render(<Button>Default</Button>);
      
      const button = screen.getByText("Default");
      expect(button.className).toContain("bg-zinc-900");
      expect(button.className).toContain("px-8");
      expect(button.className).toContain("py-4");
    });
  });
});
