import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";

describe("Footer", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not expose the footer brand as a page heading", () => {
    render(<Footer />);

    expect(
      screen.queryByRole("heading", { name: /fira\s+estudio/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps footer navigation links available", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Productos" })).toHaveAttribute(
      "href",
      "/productos",
    );
  });
});
