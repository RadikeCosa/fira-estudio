import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("does not render when there is only one page", () => {
    const { container } = render(
      <Pagination
        page={1}
        totalPages={1}
        hasNextPage={false}
        hasPreviousPage={false}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders disabled previous control as non-link", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        hasNextPage
        hasPreviousPage={false}
      />,
    );

    expect(screen.getByText("Anterior").tagName).toBe("SPAN");
    expect(screen.queryByRole("link", { name: /Anterior/i })).not.toBeInTheDocument();
  });

  it("renders disabled next control as non-link", () => {
    render(
      <Pagination
        page={3}
        totalPages={3}
        hasNextPage={false}
        hasPreviousPage
      />,
    );

    expect(screen.getByText("Siguiente").tagName).toBe("SPAN");
    expect(screen.queryByRole("link", { name: /Siguiente/i })).not.toBeInTheDocument();
  });

  it("marks current page information with aria-current", () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
        hasNextPage
        hasPreviousPage
      />,
    );

    expect(screen.getByText("Página 2 de 3")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps active navigation links with correct hrefs", () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
        hasNextPage
        hasPreviousPage
        categoriaSlug="manteles"
      />,
    );

    expect(
      screen.getByRole("link", { name: "Ir a la página anterior" }),
    ).toHaveAttribute("href", "/productos?categoria=manteles");
    expect(
      screen.getByRole("link", { name: "Ir a la página siguiente" }),
    ).toHaveAttribute("href", "/productos?categoria=manteles&page=3");
  });
});
