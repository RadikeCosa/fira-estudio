import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNav } from "./MobileNav";
import type { NavLink } from "@/lib/constants/navigation";

// Mock the custom hooks
vi.mock("@/hooks/useScrollLock", () => ({
  useScrollLock: vi.fn(),
}));

vi.mock("@/hooks/useEscapeKey", () => ({
  useEscapeKey: vi.fn(),
}));

describe("MobileNav", () => {
  const mockLinks: NavLink[] = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "/sobre-nosotros", label: "Sobre Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ];

  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe.skip("Hamburger button", () => {
    it("renders hamburger button", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      expect(button).toBeInTheDocument();
    });

    it("has correct aria-expanded attribute when closed", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("has correct aria-expanded attribute when open", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Menu functionality", () => {
    it("does not show menu initially", () => {
      render(<MobileNav links={mockLinks} />);

      expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
      expect(screen.queryByText("Productos")).not.toBeInTheDocument();
    });

    it("shows menu when hamburger is clicked", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      expect(screen.getByText("Inicio")).toBeInTheDocument();
      expect(screen.getByText("Productos")).toBeInTheDocument();
      expect(screen.getByText("Sobre Nosotros")).toBeInTheDocument();
      expect(screen.getByText("Contacto")).toBeInTheDocument();
    });

    it("hides menu when hamburger is clicked again", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");

      // Open menu
      fireEvent.click(button);
      expect(screen.getByText("Inicio")).toBeInTheDocument();

      // Close menu
      fireEvent.click(button);
      expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    });

    it("renders all navigation links", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      mockLinks.forEach((link) => {
        const linkElement = screen.getByText(link.label);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.closest("a")).toHaveAttribute("href", link.href);
      });
    });

    it("closes menu when a link is clicked", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      const link = screen.getByText("Productos");
      fireEvent.click(link);

      expect(screen.queryByText("Productos")).not.toBeInTheDocument();
    });
  });

  describe("Overlay/Backdrop", () => {
    it("shows overlay when menu is open", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      const overlays = document.querySelectorAll('[aria-hidden="true"]');
      expect(overlays.length).toBeGreaterThan(0);
    });

    it("does not show overlay when menu is closed", () => {
      render(<MobileNav links={mockLinks} />);

      const overlays = document.querySelectorAll('[aria-hidden="true"]');
      expect(overlays.length).toBe(0);
    });

    it("closes menu when overlay is clicked", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    });
  });

  describe("Integration with custom hooks", () => {
    it("renders without errors with custom hooks", () => {
      // This test verifies MobileNav can render with mocked hooks
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      expect(button).toBeInTheDocument();
    });

    it("toggles menu state correctly", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");

      // Initially closed
      expect(button).toHaveAttribute("aria-expanded", "false");

      // Open menu
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      // Close menu
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Styling", () => {
    it("applies correct classes to hamburger button", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      expect(button).toHaveClass("flex", "flex-col", "gap-1.5");
    });

    it("applies animation classes to menu when open", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(button);

      const menu = screen.getByRole("list");
      const menuContainer = menu.closest("div");

      expect(menuContainer).toHaveClass("animate-in", "fade-in");
    });
  });

  describe("Z-index layering", () => {
    it("hamburger button has z-[60]", () => {
      render(<MobileNav links={mockLinks} />);
      const button = screen.getByLabelText("Abrir menú");
      expect(button).toHaveClass("z-[60]");
    });

    it("overlay has z-[40]", () => {
      render(<MobileNav links={mockLinks} />);
      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toHaveClass("z-[40]");
    });

    it("mobile menu has z-[50]", () => {
      render(<MobileNav links={mockLinks} />);
      const menu = screen.getByRole("dialog");
      expect(menu).toHaveClass("z-[50]");
    });
  });
});
