import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

// Mock CartIndicator component
vi.mock("./CartIndicator", () => ({
  CartIndicator: () => <div data-testid="cart-indicator">Cart</div>,
}));

// Mock MobileNav component
vi.mock("./MobileNav", () => ({
  MobileNav: ({ links }: { links: any[] }) => (
    <div data-testid="mobile-nav">Mobile Nav</div>
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Logo", () => {
    it("renders the logo", () => {
      render(<Header />);

      const logo = screen.getByText("fira Estudio");
      expect(logo).toBeInTheDocument();
    });

    it("logo links to home page", () => {
      render(<Header />);

      const logoLink = screen.getByText("fira Estudio").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Desktop Navigation", () => {
    it("renders desktop navigation links", () => {
      render(<Header />);

      // Desktop nav links should be in the DOM
      const productosLinks = screen.getAllByText("Productos");
      const nosotrosLinks = screen.getAllByText("Nosotros");
      const contactoLinks = screen.getAllByText("Contacto");

      // Should have at least one of each (desktop nav)
      expect(productosLinks.length).toBeGreaterThanOrEqual(1);
      expect(nosotrosLinks.length).toBeGreaterThanOrEqual(1);
      expect(contactoLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("desktop navigation links have correct hrefs", () => {
      render(<Header />);

      // Get all links and filter for desktop nav (not in mobile menu)
      const allLinks = screen.getAllByRole("link");
      const productosLink = allLinks.find(
        (link) =>
          link.textContent === "Productos" &&
          link.getAttribute("href") === "/productos",
      );
      const nosotrosLink = allLinks.find(
        (link) =>
          link.textContent === "Nosotros" &&
          link.getAttribute("href") === "/sobre-nosotros",
      );
      const contactoLink = allLinks.find(
        (link) =>
          link.textContent === "Contacto" &&
          link.getAttribute("href") === "/contacto",
      );

      expect(productosLink).toBeInTheDocument();
      expect(nosotrosLink).toBeInTheDocument();
      expect(contactoLink).toBeInTheDocument();
    });
  });

  describe.skip("Mobile Menu", () => {
    it("renders hamburger button", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toBeInTheDocument();
    });

    it("has correct aria-expanded attribute when closed", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("has correct aria-expanded attribute when open", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      // Get all close buttons and find the one in the header (has aria-expanded)
      const closeButtons = screen.getAllByLabelText("Cerrar menú");
      const headerCloseButton = closeButtons.find((btn) =>
        btn.hasAttribute("aria-expanded"),
      );
      expect(headerCloseButton).toHaveAttribute("aria-expanded", "true");
    });

    it("shows mobile menu when hamburger is clicked", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      // Mobile menu should show navigation links
      const mobileMenuLinks = screen.getAllByText("Productos");
      expect(mobileMenuLinks.length).toBeGreaterThan(1); // Desktop + mobile
    });

    it("closes menu when hamburger is clicked again", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");

      // Open menu
      fireEvent.click(button);
      const closeButtons = screen.getAllByLabelText("Cerrar menú");
      expect(closeButtons.length).toBeGreaterThan(0);

      // Close menu - click the header button (has aria-expanded)
      const headerCloseButton = closeButtons.find((btn) =>
        btn.hasAttribute("aria-expanded"),
      );
      if (headerCloseButton) {
        fireEvent.click(headerCloseButton);
      }
      expect(screen.getByLabelText("Abrir menú")).toBeInTheDocument();
    });

    it("closes mobile menu when a link is clicked", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      // Click on a mobile menu link (find the one in the mobile panel)
      const allProductosLinks = screen.getAllByText("Productos");
      const mobileLink = allProductosLinks[allProductosLinks.length - 1]; // Last one is in mobile menu
      fireEvent.click(mobileLink);

      // Menu should close - check by looking for button state
      expect(screen.getByLabelText("Abrir menú")).toBeInTheDocument();
    });

    it("shows overlay when menu is open", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      const overlays = document.querySelectorAll('[aria-hidden="true"]');
      // Should have overlay plus icon aria-hidden
      expect(overlays.length).toBeGreaterThan(0);
    });

    it("closes menu when overlay is clicked", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      // Find the overlay (not the icon)
      const overlay = Array.from(
        document.querySelectorAll('[aria-hidden="true"]'),
      ).find((el) => el.classList.contains("backdrop-blur-sm"));

      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(screen.getByLabelText("Abrir menú")).toBeInTheDocument();
    });
  });

  describe("Responsive behavior", () => {
    it("hamburger button has md:hidden class for desktop", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toHaveClass("md:hidden");
    });

    it("desktop navigation has hidden md:flex classes", () => {
      render(<Header />);

      // Find the desktop nav container
      const header = document.querySelector("nav");
      const desktopNav = header?.querySelector(".md\\:flex");

      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav).toHaveClass("hidden");
    });
  });

  describe("Accessibility", () => {
    it("menu button has proper aria-label", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      const closeButtons = screen.getAllByLabelText("Cerrar menú");
      expect(closeButtons.length).toBeGreaterThan(0);
      // Header button should have aria-expanded
      const headerCloseButton = closeButtons.find((btn) =>
        btn.hasAttribute("aria-expanded"),
      );
      expect(headerCloseButton).toBeInTheDocument();
    });

    it("mobile menu has proper role and aria attributes", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      const mobileMenu = screen.getByRole("dialog");
      expect(mobileMenu).toBeInTheDocument();
      expect(mobileMenu).toHaveAttribute("aria-modal", "true");
      expect(mobileMenu).toHaveAttribute("aria-label", "Menú de navegación");
    });

    it("icons have aria-hidden attribute", () => {
      render(<Header />);

      const button = screen.getByLabelText("Abrir menú");
      const icon = button.querySelector("svg");

      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });
});
