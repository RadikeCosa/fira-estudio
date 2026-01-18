/**
 * Tests to validate UI components match Phase 2 specification
 * These tests verify the component APIs match the exact spec provided
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Icon } from "./Icon";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ContactInfoItem } from "./ContactInfoItem";
import { Mail, Heart } from "lucide-react";

describe("UI Components Phase 2 - Specification Compliance", () => {
  describe("Input", () => {
    it("renders with label, placeholder and required", () => {
      render(
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
        />
      );

      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toHaveAttribute("required");
    });

    it("displays error message when error prop is provided", () => {
      render(
        <Input
          id="test"
          label="Test"
          error="Este campo es requerido"
        />
      );

      expect(screen.getByText("Este campo es requerido")).toBeInTheDocument();
    });

    it("displays helper text when provided and no error", () => {
      render(
        <Input
          id="test"
          label="Test"
          helperText="Texto de ayuda"
        />
      );

      expect(screen.getByText("Texto de ayuda")).toBeInTheDocument();
    });

    it("does not display helper text when error is present", () => {
      render(
        <Input
          id="test"
          label="Test"
          error="Error"
          helperText="Helper"
        />
      );

      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });
  });

  describe("Textarea", () => {
    it("renders with label and placeholder", () => {
      render(
        <Textarea
          id="message"
          name="message"
          label="Mensaje"
          placeholder="Escribe aquí..."
        />
      );

      expect(screen.getByLabelText(/Mensaje/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Escribe aquí...")).toBeInTheDocument();
    });

    it("applies resize-none class", () => {
      render(<Textarea id="test" label="Test" />);
      const textarea = screen.getByLabelText(/Test/);
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("Icon", () => {
    it("renders with default size and variant", () => {
      const { container } = render(<Icon icon={Heart} />);
      const iconContainer = container.firstChild as HTMLElement;
      expect(iconContainer).toHaveClass("h-14", "w-14"); // md size
    });

    it("renders with sm size", () => {
      const { container } = render(<Icon icon={Heart} size="sm" />);
      const iconContainer = container.firstChild as HTMLElement;
      expect(iconContainer).toHaveClass("h-12", "w-12");
    });

    it("renders with lg size", () => {
      const { container } = render(<Icon icon={Heart} size="lg" />);
      const iconContainer = container.firstChild as HTMLElement;
      expect(iconContainer).toHaveClass("h-16", "w-16");
    });

    it("supports group-hover animation by default", () => {
      const { container } = render(<Icon icon={Heart} />);
      const iconContainer = container.firstChild as HTMLElement;
      // Check for hover classes that work with group-hover
      expect(iconContainer.className).toContain("group-hover");
    });
  });

  describe("Card", () => {
    it("renders children with default padding", () => {
      render(
        <Card>
          <p>Content</p>
        </Card>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("applies hover effect when hover prop is true", () => {
      const { container } = render(
        <Card hover>
          <p>Content</p>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("hover");
    });

    it("supports different padding sizes", () => {
      const { rerender, container } = render(
        <Card padding="sm">
          <p>Content</p>
        </Card>
      );
      let card = container.firstChild as HTMLElement;
      expect(card.className).toContain("p-6");

      rerender(
        <Card padding="lg">
          <p>Content</p>
        </Card>
      );
      card = container.firstChild as HTMLElement;
      expect(card.className).toContain("p-10");
    });
  });

  describe("PageHeader", () => {
    it("renders title and description", () => {
      render(
        <PageHeader
          title="Contacto"
          description="¿Tenés alguna consulta? Envianos un mensaje."
        />
      );

      expect(screen.getByText("Contacto")).toBeInTheDocument();
      expect(
        screen.getByText(/¿Tenés alguna consulta\?/)
      ).toBeInTheDocument();
    });

    it("shows DecorativeBadge by default", () => {
      const { container } = render(<PageHeader title="Test" />);
      // DecorativeBadge renders a div with inline-flex and bg-gradient
      const badge = container.querySelector(".inline-flex");
      expect(badge).toBeInTheDocument();
    });

    it("hides DecorativeBadge when showBadge is false", () => {
      const { container } = render(<PageHeader title="Test" showBadge={false} />);
      const badge = container.querySelector(".inline-flex");
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe("ContactInfoItem", () => {
    it("renders icon, title and content", () => {
      render(
        <ContactInfoItem
          icon={Mail}
          title="Email"
          content="info@mumaestudio.com"
        />
      );

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("info@mumaestudio.com")).toBeInTheDocument();
    });

    it("renders as link when href is provided", () => {
      render(
        <ContactInfoItem
          icon={Mail}
          title="Email"
          content="info@mumaestudio.com"
          href="mailto:info@mumaestudio.com"
        />
      );

      const link = screen.getByText("info@mumaestudio.com");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "mailto:info@mumaestudio.com");
    });

    it("adds target blank for external links", () => {
      render(
        <ContactInfoItem
          icon={Mail}
          title="Website"
          content="mumaestudio.com"
          href="https://mumaestudio.com"
          external
        />
      );

      const link = screen.getByText("mumaestudio.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
