import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { MobileNav } from "./MobileNav";
import type { NavLink } from "@/lib/constants/navigation";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock the custom hooks
vi.mock("@/hooks", async () => {
  const { useEffect } = await vi.importActual<typeof import("react")>("react");

  return {
    useScrollLock: vi.fn(),
    useEscapeKey: (onEscape: () => void, isActive = true) => {
      useEffect(() => {
        if (!isActive) return;

        const handleEscape = (event: KeyboardEvent): void => {
          if (event.key === "Escape") {
            onEscape();
          }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
      }, [onEscape, isActive]);
    },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
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
    vi.mocked(usePathname).mockReturnValue("/");
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe.skip("Hamburger button", () => {
    it("renders hamburger button", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toBeInTheDocument();
    });

    it("has correct aria-expanded attribute when closed", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("has correct aria-expanded attribute when open", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Menu functionality", () => {
    it("does not show menu initially", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Productos")).not.toBeInTheDocument();
    });

    it("does not force focus to the trigger on initial render", () => {
      render(<MobileNav links={mockLinks} />);

      expect(screen.getByLabelText("Abrir menú")).not.toHaveFocus();
    });

    it("shows menu when hamburger is clicked", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("dialog")).toHaveClass("translate-x-0");
    });

    it("moves focus into the menu when opened", () => {
      render(<MobileNav links={mockLinks} />);

      fireEvent.click(screen.getByLabelText("Abrir menú"));

      expect(screen.getByRole("link", { name: "Inicio" })).toHaveFocus();
    });

    it("hides menu when hamburger is clicked again", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");

      // Open menu
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      // Close menu
      fireEvent.click(button);
      expect(screen.getByLabelText("Abrir menú")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Abrir menú")).toHaveFocus();
    });

    it("renders all navigation links", () => {
      render(<MobileNav links={mockLinks} />);

      fireEvent.click(screen.getByLabelText("Abrir menú"));

      mockLinks.forEach((link) => {
        const linkElement = screen.getByText(link.label);
        expect(linkElement).toBeInTheDocument();
        expect(linkElement.closest("a")).toHaveAttribute("href", link.href);
      });
    });

    it("closes menu when a link is clicked", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      const link = screen.getByText("Productos");
      fireEvent.click(link);

      expect(screen.getByLabelText("Abrir menú")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("closes menu with Escape and restores focus to the trigger", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Abrir menú")).toHaveFocus();
    });

    it("marks the active mobile link with aria-current", () => {
      vi.mocked(usePathname).mockReturnValue("/productos/camino-magnolia");

      render(<MobileNav links={mockLinks} />);

      fireEvent.click(screen.getByLabelText("Abrir menú"));

      const currentLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page");

      expect(currentLinks).toHaveLength(1);
      expect(currentLinks[0]).toHaveTextContent("Productos");
    });
  });

  describe("Overlay/Backdrop", () => {
    it("shows overlay when menu is open", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toHaveClass("opacity-100");
      expect(overlay).toHaveClass("pointer-events-auto");
    });

    it("does not show overlay when menu is closed", () => {
      render(<MobileNav links={mockLinks} />);

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).not.toBeInTheDocument();
    });

    it("closes menu when overlay is clicked", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(screen.getByLabelText("Abrir menú")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Integration with custom hooks", () => {
    it("renders without errors with custom hooks", () => {
      // This test verifies MobileNav can render with mocked hooks
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toBeInTheDocument();
    });

    it("toggles menu state correctly", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");

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

      const button = screen.getByLabelText("Abrir menú");
      expect(button).toHaveClass("flex", "flex-col", "gap-1.5");
    });

    it("applies animation classes to menu when open", () => {
      render(<MobileNav links={mockLinks} />);

      const button = screen.getByLabelText("Abrir menú");
      fireEvent.click(button);

      const menu = screen.getByRole("dialog");
      expect(menu).toHaveClass("animate-in", "fade-in");
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
      fireEvent.click(screen.getByLabelText("Abrir menú"));

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toHaveClass("z-[40]");
    });

    it("mobile menu has z-[50]", () => {
      render(<MobileNav links={mockLinks} />);
      fireEvent.click(screen.getByLabelText("Abrir menú"));

      const menu = screen.getByRole("dialog");
      expect(menu).toHaveClass("z-[50]");
    });
  });
});
