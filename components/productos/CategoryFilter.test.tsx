import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { CategoryFilter } from "./CategoryFilter";
import type { Categoria } from "@/lib/types";
import type { ReadonlyURLSearchParams } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

// Mock analytics
vi.mock("@/lib/analytics/gtag", () => ({
  trackCategoryFilter: vi.fn(),
}));

describe("CategoryFilter", () => {
  // Helper to create typed mock for useSearchParams
  const mockSearchParams = (categoria: string | null) => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(categoria),
    } as unknown as ReadonlyURLSearchParams);
  };

  const mockCategorias: Categoria[] = [
    {
      id: "cat-1",
      nombre: "Manteles",
      slug: "manteles",
      descripcion: "Manteles artesanales",
      orden: 1,
    },
    {
      id: "cat-2",
      nombre: "Servilletas",
      slug: "servilletas",
      descripcion: "Servilletas decorativas",
      orden: 2,
    },
    {
      id: "cat-3",
      nombre: "Caminos de Mesa",
      slug: "caminos-mesa",
      descripcion: "Caminos elegantes",
      orden: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all categories", () => {
    mockSearchParams(null);

    render(<CategoryFilter categorias={mockCategorias} />);

    expect(screen.getByText("Manteles")).toBeInTheDocument();
    expect(screen.getByText("Servilletas")).toBeInTheDocument();
    expect(screen.getByText("Caminos de Mesa")).toBeInTheDocument();
  });

  it("renders 'Todos' button", () => {
    mockSearchParams(null);

    render(<CategoryFilter categorias={mockCategorias} />);

    expect(screen.getByText("Todos")).toBeInTheDocument();
  });

  it("marks 'Todos' as active when no category is selected", () => {
    mockSearchParams(null);

    render(<CategoryFilter categorias={mockCategorias} />);

    const todosButton = screen.getByText("Todos");
    expect(todosButton).toHaveClass("bg-foreground");
    expect(todosButton).toHaveClass("text-background");
  });

  it("marks category as active when selected", () => {
    mockSearchParams("manteles");

    render(<CategoryFilter categorias={mockCategorias} />);

    const mantelesButton = screen.getByText("Manteles");
    expect(mantelesButton).toHaveClass("bg-foreground");
    expect(mantelesButton).toHaveClass("text-background");
  });

  it("renders correct links for each category", () => {
    mockSearchParams(null);

    render(<CategoryFilter categorias={mockCategorias} />);

    const mantelesLink = screen.getByText("Manteles").closest("a");
    expect(mantelesLink).toHaveAttribute(
      "href",
      "/productos?categoria=manteles"
    );

    const servilletasLink = screen.getByText("Servilletas").closest("a");
    expect(servilletasLink).toHaveAttribute(
      "href",
      "/productos?categoria=servilletas"
    );
  });

  it("renders 'Todos' link to /productos", () => {
    mockSearchParams(null);

    render(<CategoryFilter categorias={mockCategorias} />);

    const todosLink = screen.getByText("Todos").closest("a");
    expect(todosLink).toHaveAttribute("href", "/productos");
  });

  it("handles empty categories array", () => {
    mockSearchParams(null);

    const { container } = render(<CategoryFilter categorias={[]} />);

    // Should return null and not render anything
    expect(container.firstChild).toBeNull();
  });

  it("marks only one category as active at a time", () => {
    mockSearchParams("servilletas");

    render(<CategoryFilter categorias={mockCategorias} />);

    const mantelesButton = screen.getByText("Manteles");
    const servilletasButton = screen.getByText("Servilletas");

    // Servilletas should be active
    expect(servilletasButton).toHaveClass("bg-foreground");

    // Manteles should NOT be active
    expect(mantelesButton).not.toHaveClass("bg-foreground");
    expect(mantelesButton).toHaveClass("bg-muted");
  });

  it("has horizontal scrollable layout", () => {
    mockSearchParams(null);

    const { container } = render(<CategoryFilter categorias={mockCategorias} />);

    const scrollContainer = container.querySelector(".overflow-x-auto");
    expect(scrollContainer).toBeInTheDocument();
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("has semantic navigation structure", () => {
      mockSearchParams(null);

      const { container } = render(
        <CategoryFilter categorias={mockCategorias} />
      );

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute(
        "aria-label",
        "Filtrar productos por categoría"
      );
    });

    it("has tablist role on button container", () => {
      mockSearchParams(null);

      const { container } = render(
        <CategoryFilter categorias={mockCategorias} />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();
    });

    it("has proper ARIA attributes on tabs", () => {
      mockSearchParams("manteles");

      render(<CategoryFilter categorias={mockCategorias} />);

      const mantelesLink = screen.getByText("Manteles").closest("a");
      const servilletasLink = screen.getByText("Servilletas").closest("a");

      // Active tab should have aria-selected="true" and aria-current="page"
      expect(mantelesLink).toHaveAttribute("role", "tab");
      expect(mantelesLink).toHaveAttribute("aria-selected", "true");
      expect(mantelesLink).toHaveAttribute("aria-current", "page");

      // Inactive tab should have aria-selected="false" and no aria-current
      expect(servilletasLink).toHaveAttribute("role", "tab");
      expect(servilletasLink).toHaveAttribute("aria-selected", "false");
      expect(servilletasLink).not.toHaveAttribute("aria-current");
    });

    it("has aria-current on Todos when no category selected", () => {
      mockSearchParams(null);

      render(<CategoryFilter categorias={mockCategorias} />);

      const todosLink = screen.getByText("Todos").closest("a");

      expect(todosLink).toHaveAttribute("aria-selected", "true");
      expect(todosLink).toHaveAttribute("aria-current", "page");
    });

    it("has focus-visible styles for keyboard navigation", () => {
      mockSearchParams(null);

      render(<CategoryFilter categorias={mockCategorias} />);

      const todosLink = screen.getByText("Todos").closest("a");

      // Check that focus-visible classes are present
      expect(todosLink).toHaveClass("focus-visible:outline-none");
      expect(todosLink).toHaveClass("focus-visible:ring-2");
      expect(todosLink).toHaveClass("focus-visible:ring-foreground");
    });
  });
});
