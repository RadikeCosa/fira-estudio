import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ImagenProducto } from "@/lib/types";
import { ProductGallery } from "./ProductGallery";

const imagenes: ImagenProducto[] = [
  {
    id: "img-1",
    producto_id: "prod-1",
    url: "/images/productos/uno.jpg",
    alt_text: null,
    orden: 1,
    es_principal: true,
  },
  {
    id: "img-2",
    producto_id: "prod-1",
    url: "/images/productos/dos.jpg",
    alt_text: null,
    orden: 2,
    es_principal: false,
  },
];

describe("ProductGallery", () => {
  it("uses product name as informative fallback alt", () => {
    render(<ProductGallery imagenes={[]} productName="Camino Magnolia" />);

    expect(screen.getByAltText("Camino Magnolia, vista principal")).toBeInTheDocument();
  });

  it("does not react to global arrow key events", () => {
    render(<ProductGallery imagenes={imagenes} productName="Camino Magnolia" />);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(screen.getByAltText("Camino Magnolia, vista principal")).toBeInTheDocument();
    expect(screen.queryByAltText("Camino Magnolia, detalle 2")).not.toBeInTheDocument();
  });

  it("reacts to arrow keys when focus is inside the gallery", () => {
    render(<ProductGallery imagenes={imagenes} productName="Camino Magnolia" />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "Ver imagen 1" }), {
      key: "ArrowRight",
    });

    expect(screen.getByAltText("Camino Magnolia, detalle")).toBeInTheDocument();
  });

  it("keeps thumbnail navigation working", () => {
    render(<ProductGallery imagenes={imagenes} productName="Camino Magnolia" />);

    fireEvent.click(screen.getByRole("tab", { name: "Ver imagen 2" }));

    expect(screen.getByAltText("Camino Magnolia, detalle")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Ver imagen 2" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("uses view-specific descriptive fallback text for gallery images", () => {
    const views: ImagenProducto[] = ["principal", "detalle", "estampa", "terminacion"].map(
      (view, index) => ({
        id: `img-${index}`,
        producto_id: "prod-1",
        url: `/images/${view}.webp`,
        alt_text: null,
        orden: index,
        es_principal: index === 0,
      }),
    );
    render(<ProductGallery imagenes={views} productName="Mantel Picnic" />);

    for (const [index, label] of ["vista principal", "detalle", "estampa", "terminación"].entries()) {
      if (index > 0) fireEvent.click(screen.getByRole("tab", { name: `Ver imagen ${index + 1}` }));
      expect(screen.getByAltText(`Mantel Picnic, ${label}`)).toBeInTheDocument();
    }
  });
});
