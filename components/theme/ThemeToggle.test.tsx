import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import type { ResolvedTheme, ThemePreference } from "./theme";

const themeMock = vi.hoisted(() => ({
  value: {
    theme: "system" as ThemePreference,
    resolvedTheme: "light" as ResolvedTheme,
    setTheme: vi.fn(),
  },
}));

vi.mock("./ThemeProvider", () => ({
  useTheme: () => themeMock.value,
}));

function setThemeContext({
  theme,
  resolvedTheme,
}: {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
}) {
  themeMock.value = {
    theme,
    resolvedTheme,
    setTheme: vi.fn(),
  };
}

describe("ThemeToggle", () => {
  it("shows an action to switch to dark when resolved theme is light", async () => {
    setThemeContext({ theme: "system", resolvedTheme: "light" });

    render(<ThemeToggle />);

    expect(
      await screen.findByRole("button", { name: "Cambiar a modo oscuro" }),
    ).toBeInTheDocument();
  });

  it("shows an action to switch to light when resolved theme is dark", async () => {
    setThemeContext({ theme: "system", resolvedTheme: "dark" });

    render(<ThemeToggle />);

    expect(
      await screen.findByRole("button", { name: "Cambiar a modo claro" }),
    ).toBeInTheDocument();
  });

  it("sets a manual dark preference from resolved light", async () => {
    setThemeContext({ theme: "system", resolvedTheme: "light" });

    render(<ThemeToggle />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Cambiar a modo oscuro" }),
    );

    expect(themeMock.value.setTheme).toHaveBeenCalledWith("dark");
  });

  it("sets a manual light preference from resolved dark", async () => {
    setThemeContext({ theme: "system", resolvedTheme: "dark" });

    render(<ThemeToggle />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Cambiar a modo claro" }),
    );

    expect(themeMock.value.setTheme).toHaveBeenCalledWith("light");
  });

  it("renders a native accessible icon button without pressed state", async () => {
    setThemeContext({ theme: "light", resolvedTheme: "light" });

    const { container } = render(<ThemeToggle />);
    const button = await screen.findByRole("button", {
      name: "Cambiar a modo oscuro",
    });

    expect(button).toHaveAttribute("type", "button");
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(button).toHaveClass("min-h-11", "min-w-11", "focus:ring-2");
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("uses resolved light even when current preference is system", async () => {
    setThemeContext({ theme: "system", resolvedTheme: "light" });

    render(<ThemeToggle />);

    expect(
      await screen.findByRole("button", { name: "Cambiar a modo oscuro" }),
    ).toBeInTheDocument();
  });

  it("uses resolved dark even when current preference is system", async () => {
    setThemeContext({ theme: "system", resolvedTheme: "dark" });

    render(<ThemeToggle />);

    expect(
      await screen.findByRole("button", { name: "Cambiar a modo claro" }),
    ).toBeInTheDocument();
  });
});
