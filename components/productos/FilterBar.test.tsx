import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "./FilterBar";
import type { Categoria, ProductoCompleto } from "@/lib/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    getAll: () => [],
    get: () => null,
  }),
}));

describe("FilterBar", () => {
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
      descripcion: "Servilletas artesanales",
      orden: 2,
    },
  ];

  const mockProductos: ProductoCompleto[] = [
    {
      id: "prod-1",
      nombre: "Mantel Floral",
      slug: "mantel-floral",
      descripcion: "Mantel artesanal",
      categoria_id: "cat-1",
      precio_desde: 15000,
      destacado: false,
      activo: true,
      tiempo_fabricacion: "3-5 días",
      material: "Algodón",
      cuidados: "Lavar a mano",
      created_at: "2024-01-01T00:00:00Z",
      categoria: mockCategorias[0],
      variaciones: [],
      imagenes: [],
    },
    {
      id: "prod-2",
      nombre: "Servilleta Rosa",
      slug: "servilleta-rosa",
      descripcion: "Servilleta artesanal",
      categoria_id: "cat-2",
      precio_desde: 8000,
      destacado: false,
      activo: true,
      tiempo_fabricacion: "2-3 días",
      material: "Lino",
      cuidados: "Lavar a mano",
      created_at: "2024-01-02T00:00:00Z",
      categoria: mockCategorias[1],
      variaciones: [],
      imagenes: [],
    },
  ];

  it("renders categories section", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    expect(screen.getByText("Categorías")).toBeInTheDocument();
    expect(screen.getByText("Manteles")).toBeInTheDocument();
    expect(screen.getByText("Servilletas")).toBeInTheDocument();
  });

  it("renders price range section", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    expect(screen.getByText("Rango de Precio")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mínimo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Máximo")).toBeInTheDocument();
  });

  it("renders filter buttons", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    expect(screen.getByText("Aplicar Precio")).toBeInTheDocument();
    expect(screen.getByText("Limpiar Filtros")).toBeInTheDocument();
  });

  it("displays product count", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    expect(screen.getByText("2 productos")).toBeInTheDocument();
  });

  it("allows category selection", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    const mantelesCheckbox = screen.getByRole("checkbox", { name: /Manteles/i });
    expect(mantelesCheckbox).not.toBeChecked();

    fireEvent.click(mantelesCheckbox);
    expect(mantelesCheckbox).toBeChecked();
  });

  it("allows price input", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    const minPriceInput = screen.getByPlaceholderText("Mínimo") as HTMLInputElement;
    const maxPriceInput = screen.getByPlaceholderText("Máximo") as HTMLInputElement;

    fireEvent.change(minPriceInput, { target: { value: "5000" } });
    fireEvent.change(maxPriceInput, { target: { value: "20000" } });

    expect(minPriceInput.value).toBe("5000");
    expect(maxPriceInput.value).toBe("20000");
  });

  it("clears all filters when clicking Limpiar Filtros", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    // Set some filters
    const mantelesCheckbox = screen.getByRole("checkbox", { name: /Manteles/i });
    fireEvent.click(mantelesCheckbox);

    const minPriceInput = screen.getByPlaceholderText("Mínimo") as HTMLInputElement;
    fireEvent.change(minPriceInput, { target: { value: "5000" } });

    // Clear filters
    const clearButton = screen.getByText("Limpiar Filtros");
    fireEvent.click(clearButton);

    expect(mantelesCheckbox).not.toBeChecked();
    expect(minPriceInput.value).toBe("");
  });

  it("has proper styling classes", () => {
    render(<FilterBar categorias={mockCategorias} productos={mockProductos} />);

    const aside = screen.getByRole("complementary");
    expect(aside).toHaveClass("bg-white");
    expect(aside).toHaveClass("rounded-2xl");
  });
});
