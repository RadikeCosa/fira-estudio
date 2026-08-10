import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CollectionsGrid } from "./CollectionsGrid";
import { getCategorias } from "@/lib/supabase/queries";

vi.mock("@/lib/supabase/queries", () => ({
  getCategorias: vi.fn(),
}));

describe("CollectionsGrid", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.mocked(getCategorias).mockResolvedValue([
      {
        id: "cat-1",
        nombre: "Manteles",
        slug: "manteles",
        descripcion: "Piezas para la mesa",
        orden: 1,
        imagen: null,
        featured: false,
      },
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("keeps collections as navigable links without nested button semantics", async () => {
    render(await CollectionsGrid());

    expect(
      screen.getByRole("link", { name: /explorar colección manteles/i }),
    ).toHaveAttribute("href", "/productos?categoria=manteles");
    expect(screen.queryByRole("button", { name: /explorar colección/i }))
      .not.toBeInTheDocument();
  });
});
