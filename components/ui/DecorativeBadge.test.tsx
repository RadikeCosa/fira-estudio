/**
 * Tests for DecorativeBadge component with new boutique variants
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DecorativeBadge } from "./DecorativeBadge";

describe("DecorativeBadge - Boutique Design System", () => {
  describe("Backward compatibility (no children)", () => {
    it("renders decorative line when no children provided", () => {
      const { container } = render(<DecorativeBadge />);
      
      // Should render decorative line (div with inline-flex and gradient)
      const decorativeLine = container.querySelector(".inline-flex");
      expect(decorativeLine).toBeInTheDocument();
      expect(decorativeLine?.className).toContain("bg-gradient-to-r");
    });

    it("applies custom className to container when no children", () => {
      const { container } = render(<DecorativeBadge className="custom-class" />);
      
      const wrapper = container.querySelector(".custom-class");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Badge variants (with children)", () => {
    it("renders outline variant with children", () => {
      render(<DecorativeBadge variant="outline">Pieza Única</DecorativeBadge>);
      
      const badge = screen.getByText("Pieza Única");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
      expect(badge.className).toContain("border");
      expect(badge.className).toContain("uppercase");
    });

    it("renders filled variant with children", () => {
      render(<DecorativeBadge variant="filled">Nuevo</DecorativeBadge>);
      
      const badge = screen.getByText("Nuevo");
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-primary");
      expect(badge.className).toContain("text-white");
      expect(badge.className).toContain("uppercase");
    });

    it("applies custom className to badge with children", () => {
      render(
        <DecorativeBadge variant="outline" className="ml-4">
          Test
        </DecorativeBadge>
      );
      
      const badge = screen.getByText("Test");
      expect(badge.className).toContain("ml-4");
    });

    it("defaults to outline variant when not specified", () => {
      render(<DecorativeBadge>Default</DecorativeBadge>);
      
      const badge = screen.getByText("Default");
      expect(badge.className).toContain("border");
    });
  });
});
