import { describe, expect, it } from "vitest";
import { metadata as homeMetadata } from "./page";

describe("home metadata", () => {
  it("uses a non-brand page title so the global template does not duplicate it", () => {
    expect(homeMetadata.title).toBe("Textiles artesanales");
  });

  it("describes the catalog and consultation intent", () => {
    expect(homeMetadata.description).toBe(
      "Textiles artesanales para la mesa y el hogar: manteles, servilletas, caminos de mesa y otras piezas. Explorá el catálogo y consultá disponibilidad.",
    );
  });
});
