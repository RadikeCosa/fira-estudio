import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryFilter } from "./CategoryFilter";
import { useRouter } from "next/navigation";
import { trackCategoryFilter } from "@/lib/analytics/gtag";
import type { Categoria } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@/lib/analytics/gtag", () => ({ trackCategoryFilter: vi.fn() }));

const categories: Categoria[] = [
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
    descripcion: "Servilletas textiles",
    orden: 2,
  },
];

describe("CategoryFilter", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push } as never);
  });

  it("uses route links on desktop and a labeled native selector on mobile", () => {
    render(<CategoryFilter categorias={categories} activeCategorySlug="manteles" />);

    expect(screen.getByLabelText("Elegí una categoría")).toHaveValue("manteles");
    expect(screen.getByRole("link", { name: "Manteles" })).toHaveAttribute(
      "href",
      "/productos/categoria/manteles",
    );
    expect(screen.getByRole("link", { name: "Manteles" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("announces and navigates to a selected category", () => {
    render(<CategoryFilter categorias={categories} />);

    fireEvent.change(screen.getByLabelText("Elegí una categoría"), {
      target: { value: "servilletas" },
    });

    expect(screen.getByText("Abriendo categoría Servilletas")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(push).toHaveBeenCalledWith("/productos/categoria/servilletas");
    expect(trackCategoryFilter).toHaveBeenCalledWith("servilletas", "Servilletas");
  });

  it("navigates back to the full catalog when Todos is selected", () => {
    render(<CategoryFilter categorias={categories} activeCategorySlug="manteles" />);

    fireEvent.change(screen.getByLabelText("Elegí una categoría"), {
      target: { value: "" },
    });

    expect(push).toHaveBeenCalledWith("/productos");
  });
});
