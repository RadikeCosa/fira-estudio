/**
 * Tests for About page components
 * Validates that AboutSection and ValuesGrid render correctly with content
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutSection } from "./AboutSection";
import { ValuesGrid } from "./ValuesGrid";
import { Heart, Sparkles } from "lucide-react";

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

    expect(screen.getByText("Nuestros Valores")).toBeInTheDocument();
    expect(
      screen.getByText("Los pilares que guían nuestro trabajo diario"),
    ).toBeInTheDocument();
  });

  it("renders all four value cards", () => {
    render(<ValuesGrid />);

    // Check all four values from ABOUT_CONTENT
    expect(screen.getByText("Calidad Artesanal")).toBeInTheDocument();
    expect(screen.getByText("Diseño Consciente")).toBeInTheDocument();
    expect(screen.getByText("Producción Responsable")).toBeInTheDocument();
    expect(screen.getByText("Atención Personalizada")).toBeInTheDocument();
  });

  it("renders value descriptions", () => {
    render(<ValuesGrid />);

    // Check for descriptions - these are complete texts from ABOUT_CONTENT
    expect(
      screen.getByText(/Nos comprometemos con la excelencia en cada pieza/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Diseñamos con propósito/)).toBeInTheDocument();
    expect(
      screen.getByText(/Trabajamos de manera consciente y responsable/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cada cliente es importante para nosotros/),
    ).toBeInTheDocument();
  });

  it("applies grid layout classes", () => {
    const { container } = render(<ValuesGrid />);
    const grid = container.querySelector(".grid");

    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid-cols-1", "sm:grid-cols-2");
  });
});
