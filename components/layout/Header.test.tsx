import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { NavLink } from "@/lib/constants/navigation";
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
  MobileNav: ({ links }: { links: NavLink[] }) => {
    void links;
    return <div data-testid="mobile-nav">Mobile Nav</div>;
  },
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Logo", () => {
    it("renders the logo", () => {
      render(<Header />);

      const logoLink = screen.getByRole("link", { name: /fira\s+estudio/i });
      expect(logoLink).toBeInTheDocument();
    });

    it("logo links to home page", () => {
      render(<Header />);

      const logoLink = screen.getByRole("link", { name: /fira\s+estudio/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("does not introduce a global h1 in the header", () => {
      const { container } = render(<Header />);

      expect(container.querySelector("h1")).not.toBeInTheDocument();
    });
  });

  describe("Desktop Navigation", () => {
    it("renders desktop navigation links", () => {
      render(<Header />);

      // Desktop nav links should be in the DOM
      const inicioLinks = screen.getAllByText("Inicio");
      const productosLinks = screen.getAllByText("Productos");
      const nosotrosLinks = screen.getAllByText("Nosotros");
      const contactoLinks = screen.getAllByText("Contacto");

      // Should have at least one of each (desktop nav)
      expect(inicioLinks.length).toBeGreaterThanOrEqual(1);
      expect(productosLinks.length).toBeGreaterThanOrEqual(1);
      expect(nosotrosLinks.length).toBeGreaterThanOrEqual(1);
      expect(contactoLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("desktop navigation links have correct hrefs", () => {
      render(<Header />);

      // Get all links and filter for desktop nav (not in mobile menu)
      const allLinks = screen.getAllByRole("link");
      const inicioLink = allLinks.find(
        (link) =>
          link.textContent === "Inicio" && link.getAttribute("href") === "/",
      );
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

      expect(inicioLink).toBeInTheDocument();
      expect(productosLink).toBeInTheDocument();
      expect(nosotrosLink).toBeInTheDocument();
      expect(contactoLink).toBeInTheDocument();
    });

    it("does not expose cart or checkout links", () => {
      render(<Header />);

      const hrefs = screen
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"));

      expect(hrefs).not.toContain("/carrito");
      expect(hrefs).not.toContain("/checkout");
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
    it("renders the mobile navigation container", () => {
      render(<Header />);

      expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
    });

    it("desktop navigation has hidden md:flex classes", () => {
      render(<Header />);

      // Find the desktop nav container
      const header = document.querySelector("nav");
      const desktopNav = header?.querySelector(".md\\:flex");

      expect(desktopNav).toBeInTheDocument();
      expect(desktopNav).toHaveClass("hidden");
    });

    it("does not render the cart indicator in the public header", () => {
      render(<Header />);

      expect(screen.queryByTestId("cart-indicator")).not.toBeInTheDocument();
    });
  });
});
