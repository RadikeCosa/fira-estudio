import { describe, expect, it } from "vitest";
import { buildContactContext } from "./page";

describe("contact page search params", () => {
  it("ignores variation context without a product", () => {
    expect(buildContactContext({ variante: "Large / Azul" })).toBeUndefined();
  });

  it("normalizes whitespace and preserves product context", () => {
    expect(
      buildContactContext({
        producto: "  Camino   Magnolia  ",
        variante: " Large   /   Azul ",
      }),
    ).toEqual({
      producto: "Camino Magnolia",
      variante: "Large / Azul",
    });
  });

  it("limits long context params", () => {
    const longValue = "Mantel ".repeat(40);
    const context = buildContactContext({
      producto: longValue,
      variante: longValue,
    });

    expect(context?.producto).toHaveLength(120);
    expect(context?.variante).toHaveLength(120);
  });
});
