import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { THEME_STORAGE_KEY } from "./theme";

type MediaListener = (event: MediaQueryListEvent) => void;

function createMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<MediaListener>();
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: vi.fn((_event: "change", listener: MediaListener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_event: "change", listener: MediaListener) => {
      listeners.delete(listener);
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQueryList),
  );

  return {
    mediaQueryList,
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div>
      <p data-testid="theme">{theme}</p>
      <p data-testid="resolved-theme">{resolvedTheme}</p>
      {(["system", "light", "dark"] as const).map((preference) => (
        <button
          key={preference}
          type="button"
          onClick={() => setTheme(preference)}
        >
          {preference}
        </button>
      ))}
    </div>
  );
}

function renderThemeProvider() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes system theme and resolved dark theme from media", () => {
    createMatchMediaMock(true);

    renderThemeProvider();

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("setTheme('dark') applies and persists dark", () => {
    createMatchMediaMock(false);

    renderThemeProvider();
    fireEvent.click(screen.getByRole("button", { name: "dark" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("setTheme('light') applies and persists light", () => {
    createMatchMediaMock(true);

    renderThemeProvider();
    fireEvent.click(screen.getByRole("button", { name: "light" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("setTheme('system') returns to media query", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    createMatchMediaMock(false);

    renderThemeProvider();
    fireEvent.click(screen.getByRole("button", { name: "system" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("updates resolved theme on media changes while using system", () => {
    const matchMediaMock = createMatchMediaMock(false);

    renderThemeProvider();
    act(() => matchMediaMock.setMatches(true));

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("does not react to media changes while using manual override", () => {
    const matchMediaMock = createMatchMediaMock(false);

    renderThemeProvider();
    fireEvent.click(screen.getByRole("button", { name: "light" }));
    act(() => matchMediaMock.setMatches(true));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });
});
