/**
 * Tests for About page components
 * Validates that AboutSection and ValuesGrid render correctly with content
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutSection } from "./AboutSection";
import { ValuesGrid } from "./ValuesGrid";
import { Heart, Sparkles } from "lucide-react";
import { ABOUT_CONTENT } from "@/lib/content/sobre-nosotros";

describe("AboutSection", () => {
  it("renders title with icon", () => {
    render(
      <AboutSection
        title="Nuestra Historia"
        icon={Heart}
        paragraphs={["Test paragraph"]}
      />,
    );

    expect(screen.getByText("Nuestra Historia")).toBeInTheDocument();
    expect(screen.getByText("Test paragraph")).toBeInTheDocument();
  });

  it("renders multiple paragraphs", () => {
    const paragraphs = [
      "First paragraph",
      "Second paragraph",
      "Third paragraph",
    ];

    render(
      <AboutSection
        title="Test Section"
        icon={Sparkles}
        paragraphs={paragraphs}
      />,
    );

    paragraphs.forEach((paragraph) => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
  });

  it("renders contextual catalog links inside paragraph copy", () => {
    render(
      <AboutSection
        title="Proceso"
        icon={Sparkles}
        paragraphs={[
          {
            before: "Podés ",
            link: {
              text: "ver el catálogo",
              href: "/productos",
            },
            after: " para conocer nuestras piezas.",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "ver el catálogo" }))
      .toHaveAttribute("href", "/productos");
  });

  it("applies correct heading styles", () => {
    render(
      <AboutSection title="Test Title" icon={Heart} paragraphs={["Content"]} />,
    );

    const heading = screen.getByText("Test Title");
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveClass("text-3xl", "font-bold", "text-foreground");
  });
});

describe("ValuesGrid", () => {
  it("renders section header with title and description", () => {
    render(<ValuesGrid />);

    expect(screen.getByText("Lo que cuidamos")).toBeInTheDocument();
    expect(
      screen.getByText("Decisiones concretas detrás de cada pieza"),
    ).toBeInTheDocument();
  });

  it("renders all three value cards", () => {
    render(<ValuesGrid />);

    // Check all four values from ABOUT_CONTENT
    expect(screen.getByText("Diseño para lo cotidiano")).toBeInTheDocument();
    expect(screen.getByText("Oficio textil")).toBeInTheDocument();
    expect(screen.getByText("Producción cuidada")).toBeInTheDocument();
  });

  it("renders value descriptions", () => {
    render(<ValuesGrid />);

    // Check for descriptions - these are complete texts from ABOUT_CONTENT
    expect(
      screen.getByText(/Diseñamos textiles que se integran al uso diario/),
    ).toBeInTheDocument();
    expect(screen.getByText(/La confección y la serigrafía manual/)).toBeInTheDocument();
    expect(
      screen.getByText(/Revisamos costuras, estampas y terminaciones/),
    ).toBeInTheDocument();
  });

  it("includes a contextual catalog link in the real process content", () => {
    render(<AboutSection {...ABOUT_CONTENT.sections.proceso} />);

    expect(screen.getByRole("link", { name: "ver el catálogo" }))
      .toHaveAttribute("href", "/productos");
  });

  it("applies grid layout classes", () => {
    const { container } = render(<ValuesGrid />);
    const grid = container.querySelector(".grid");

    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid-cols-1", "sm:grid-cols-2");
  });
});
